import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parseRebFile } from '../services/reb-parser.ts';
import { rebReportCollection } from '../db/database.ts';
import { Request, Response } from 'express';

const IMPORTS_DIR = 'C:\\Metatrader\\Imports';

async function findRebFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findRebFiles(fullPath);
      results.push(...nested);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.reb')) {
      results.push(fullPath);
    }
  }

  return results;
}

export async function handleSync(req: Request, res: Response) {
  try {
    const files = await findRebFiles(IMPORTS_DIR);
    const collection = rebReportCollection();

    const results = { inserted: 0, skipped: 0, errors: [] as string[] };

    for (const filePath of files) {
      try {
        const existing = collection.findOne({ path: filePath });

        if (existing) {
          results.skipped++;
          continue;
        }

        const report = await parseRebFile(filePath);

        collection.insert({
          ...report,
          id: crypto.randomUUID(),
        });

        results.inserted++;
      } catch (err) {
        results.errors.push(`${filePath}: ${String(err)}`);
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({
      error: 'Sync failed',
      detail: String(err),
    });
  }
}
