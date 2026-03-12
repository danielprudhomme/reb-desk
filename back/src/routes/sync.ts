import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { parseRebFile } from '../services/reb-parser.ts';
import { getOptimizationReports } from '../db/database.ts';
import type { OptimizationReport } from '@shared/models/optimization-report.ts';

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

export async function handleSync(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const files = await findRebFiles(IMPORTS_DIR);
    const collection = getOptimizationReports();

    const results = { inserted: 0, skipped: 0, errors: [] as string[] };

    for (const filePath of files) {
      try {
        // Skip if already imported
        const existing = collection.findOne({ path: filePath });
        if (existing) {
          results.skipped++;
          continue;
        }

        const report = await parseRebFile(filePath);
        collection.insert({ ...report, id: crypto.randomUUID() } as OptimizationReport);
        results.inserted++;
      } catch (err) {
        results.errors.push(`${filePath}: ${String(err)}`);
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Sync failed', detail: String(err) }));
  }
}