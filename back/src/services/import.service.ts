import { readdir, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
import { ParsedRebParameter, ParsedRebReport, parseRebFile } from './reb-parser.service.ts';
import crypto from 'node:crypto';
import { IMPORTS_PATH } from 'src/config.ts';
import { collections } from 'src/db/collections.ts';
import { createHash } from 'node:crypto';

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
  const paramCollection = collections.RebParameter();

  const results = {
    notCompleted: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    deleted: 0,
    copied: 0,
    errors: [] as string[],
  };

  // const existingReports = collection.find();
  // const existingMap = new Map(existingReports.map((r) => [r.path, r]));
  // const seenPaths = new Set<string>();

  for (const filePath of files) {
    try {
      const { report: parsedReport, parameters: parsedParameters } = await parseRebFile(filePath);

      // Only import completed reports
      if (parsedReport.importStatus !== 'completed') {
        results.notCompleted++;
        continue;
      }

      const fingerprint = buildFingerprintHash(parsedReport, parsedParameters);

      const existingByFingerprint = collection.findOne({ fingerprint });

      if (existingByFingerprint) {
        results.skipped++;
        continue;
      }

      const reportId = crypto.randomUUID();

      collection.insert({
        ...parsedReport,
        id: reportId,
        mtime: Date.now(),
        fingerprint,
      });

      for (const param of parsedParameters) {
        paramCollection.insert({
          ...param,
          id: crypto.randomUUID(),
          reportId,
        });
      }

      results.inserted++;
      continue;

      // const fileName = basename(filePath);
      // const destPath = join(IMPORTS_PATH, fileName);

      // // 📁 Copy file to Imports folder
      // await copyFile(filePath, destPath);
      // results.copied++;

      // const stats = await stat(destPath);
      // const mtime = stats.mtimeMs;

      // const existing = existingMap.get(destPath);
      // seenPaths.add(destPath);

      // // ---------- NEW ----------
      // if (!existing) {
      //   const report = await parseRebFile(destPath);

      //   collection.insert({
      //     ...report,
      //     id: crypto.randomUUID(),
      //     mtime,
      //   });

      //   results.inserted++;
      //   continue;
      // }

      // // ---------- UNCHANGED ----------
      // if (existing.mtime === mtime) {
      //   results.skipped++;
      //   continue;
      // }

      // // ---------- MODIFIED ----------
      // const report = await parseRebFile(destPath);

      // existing.mtime = mtime;
      // existing.importStatus = report.importStatus;
      // existing.lastValidatedDate = report.lastValidatedDate;

      // collection.update(existing);

      // results.updated++;
    } catch (err) {
      results.errors.push(`${filePath}: ${String(err)}`);
    }
  }

  // ---------- DELETED ----------
  // for (const report of existingReports) {
  //   if (!seenPaths.has(report.path)) {
  //     collection.remove(report);
  //     results.deleted++;
  //   }
  // }

  return results;
}

function buildFingerprintHash(report: ParsedRebReport, parameters: ParsedRebParameter[]): string {
  const obj = {
    expert: report.expert,
    symbol: report.symbol,
    timeframe: report.timeframe,
    leverage: report.leverage,
    capital: report.capital,
    currency: report.currency,
    model: report.model,
    startDate: report.startDate,
    shortTermCount: report.shortTermCount,
    shortTermDuration: report.shortTermDuration,
    shortTermUnit: report.shortTermUnit,
    longTermDuration: report.longTermDuration,
    longTermUnit: report.longTermUnit,

    parameters: parameters
      .map((p) => ({
        name: p.name,
        value: p.value ?? null,
        start: p.start ?? null,
        step: p.step ?? null,
        stop: p.stop ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
  const json = JSON.stringify(obj);
  return createHash('sha1').update(json).digest('hex');
}
