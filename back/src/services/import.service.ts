import { readdir, stat, mkdir, copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, basename } from 'node:path';
import { parseRebFile } from './reb-parser.service.ts';
import crypto from 'node:crypto';
import { IMPORTS_PATH } from 'src/config.ts';
import { collections } from 'src/db/collections.ts';

async function ensureDirectory(dir: string) {
  try {
    await access(dir, constants.F_OK);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

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

export async function runImport(folderPath: string) {
  await ensureDirectory(IMPORTS_PATH);

  const files = await findRebFiles(folderPath);
  const collection = collections.RebReport();

  const results = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    deleted: 0,
    copied: 0,
    errors: [] as string[],
  };

  const existingReports = collection.find();
  const existingMap = new Map(existingReports.map((r) => [r.path, r]));
  const seenPaths = new Set<string>();

  for (const filePath of files) {
    try {
      const fileName = basename(filePath);
      const destPath = join(IMPORTS_PATH, fileName);

      // 📁 Copy file to Imports folder
      await copyFile(filePath, destPath);
      results.copied++;

      const stats = await stat(destPath);
      const mtime = stats.mtimeMs;

      const existing = existingMap.get(destPath);
      seenPaths.add(destPath);

      // ---------- NEW ----------
      if (!existing) {
        const report = await parseRebFile(destPath);

        collection.insert({
          ...report,
          id: crypto.randomUUID(),
          mtime,
        });

        results.inserted++;
        continue;
      }

      // ---------- UNCHANGED ----------
      if (existing.mtime === mtime) {
        results.skipped++;
        continue;
      }

      // ---------- MODIFIED ----------
      const report = await parseRebFile(destPath);

      existing.mtime = mtime;
      existing.importStatus = report.importStatus;
      existing.lastValidatedDate = report.lastValidatedDate;

      collection.update(existing);

      results.updated++;
    } catch (err) {
      results.errors.push(`${filePath}: ${String(err)}`);
    }
  }

  // ---------- DELETED ----------
  for (const report of existingReports) {
    if (!seenPaths.has(report.path)) {
      collection.remove(report);
      results.deleted++;
    }
  }

  return results;
}
