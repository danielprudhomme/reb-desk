import { readdir, mkdir, access, readFile, writeFile } from 'node:fs/promises';
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

  const results = {
    notCompleted: 0,
    inserted: 0,
    alreadyImported: 0,
    errors: [] as string[],
  };

  for (const filePath of files) {
    try {
      const { report: parsedReport, parameters: parsedParameters } = await parseRebFile(filePath);

      // Only import completed reports
      if (parsedReport.importStatus !== 'completed') {
        results.notCompleted++;
        continue;
      }

      const fingerprint = buildFingerprintHash(parsedReport, parsedParameters);

      const existingByFingerprint = collections.RebReport().findOne({ fingerprint });

      if (existingByFingerprint) {
        results.alreadyImported++;
        continue;
      }

      const newPath = await copyAndRenameRebFile(filePath, fingerprint);

      insert(parsedReport, parsedParameters, newPath, fingerprint);

      results.inserted++;
    } catch (err) {
      results.errors.push(`${filePath}: ${String(err)}`);
    }
  }

  return results;
}

export async function runRebuild() {
  await ensureDirectory(IMPORTS_PATH);

  const files = await findRebFiles(IMPORTS_PATH);

  const results = {
    notCompleted: 0,
    inserted: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (const filePath of files) {
    try {
      const { report: parsedReport, parameters: parsedParameters } = await parseRebFile(filePath);

      // Only import completed reports
      if (parsedReport.importStatus !== 'completed') {
        results.notCompleted++;
        continue;
      }

      const fingerprint = buildFingerprintHash(parsedReport, parsedParameters);

      const existingByPath = collections.RebReport().findOne({ path: filePath });

      if (!existingByPath) {
        insert(parsedReport, parsedParameters, filePath, fingerprint);
        results.inserted++;
        continue;
      }

      collections.RebReport().update({ ...existingByPath, ...parsedReport, fingerprint });

      const paramCollection = collections.RebParameter();

      paramCollection
        .find({ reportId: existingByPath.id })
        .forEach((p) => paramCollection.remove(p));

      for (const param of parsedParameters) {
        paramCollection.insert({
          ...param,
          id: crypto.randomUUID(),
          reportId: existingByPath.id,
        });
      }
    } catch (err) {
      results.errors.push(`${filePath}: ${String(err)}`);
    }
  }
}

function insert(
  parsedReport: ParsedRebReport,
  parsedParameters: ParsedRebParameter[],
  newPath: string,
  fingerprint: string,
) {
  const reportId = crypto.randomUUID();

  collections.RebReport().insert({
    ...parsedReport,
    path: newPath,
    id: reportId,
    mtime: Date.now(),
    fingerprint,
  });

  for (const param of parsedParameters) {
    collections.RebParameter().insert({
      ...param,
      id: crypto.randomUUID(),
      reportId,
    });
  }
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

function replaceValue(lines: string[], key: string, newValue: string) {
  const idx = lines.findIndex((l) => l.trim() === key);
  if (idx !== -1 && lines[idx + 1]) {
    lines[idx + 1] = newValue;
  }
}

async function copyAndRenameRebFile(filePath: string, fingerprint: string) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const newProjectName = fingerprint;

  replaceValue(lines, 'NOM PROJET :', newProjectName);

  const newContent = lines.join('\n');

  const newPath = join(IMPORTS_PATH, `${fingerprint}.reb`);

  await writeFile(newPath, newContent, 'utf-8');

  return newPath;
}
