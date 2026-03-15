import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parseRebFile } from './reb-parser.service.ts';
import { rebReportCollection } from 'src/modules/reb-report/reb-report.collection.ts';

const IMPORTS_DIR = 'C:\\Metatrader\\Imports\\RSI Opti 2';

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

export async function runSync() {
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

  return results;
}
