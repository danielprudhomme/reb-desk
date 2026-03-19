import { readdir, mkdir, access, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
import { parseRebFile } from './reb-parser.service.ts';
import crypto from 'node:crypto';
import { IMPORTS_PATH } from 'src/config.ts';
import { collections } from 'src/db/collections.ts';
import { createHash } from 'node:crypto';
import { ParsedRebReport } from 'src/models/parsed-reb-report.ts';
import { ParsedRebParameter } from 'src/models/parsed-reb-parameter.ts';

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

async function processRebFiles(
  folderPath: string,
  processFile: (
    parsedReport: ParsedRebReport,
    parsedParameters: ParsedRebParameter[],
    fingerprint: string,
    filePath: string,
  ) => Promise<'skipped' | 'inserted' | 'updated'>,
) {
  await ensureDirectory(IMPORTS_PATH);

  const files = await findRebFiles(folderPath);

  const results = {
    skipped: 0,
    inserted: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (const filePath of files) {
    try {
      const { report: parsedReport, parameters: parsedParameters } = await parseRebFile(filePath);

      // Only import completed reports
      if (parsedReport.importStatus !== 'completed') {
        results.skipped++;
        continue;
      }

      const fingerprint = buildFingerprintHash(parsedReport, parsedParameters);

      switch (await processFile(parsedReport, parsedParameters, fingerprint, filePath)) {
        case 'updated':
          results.updated++;
          break;
        case 'inserted':
          results.inserted++;
          break;
        case 'skipped':
          results.skipped++;
          break;
      }
    } catch (err) {
      results.errors.push(`${filePath}: ${String(err)}`);
    }
  }

  return results;
}

export async function runImport(folderPath: string) {
  const importFile = async (
    parsedReport: ParsedRebReport,
    parsedParameters: ParsedRebParameter[],
    fingerprint: string,
    filePath: string,
  ): Promise<'skipped' | 'inserted' | 'updated'> => {
    const existingByFingerprint = collections.RebReport().findOne({ fingerprint });

    if (existingByFingerprint) {
      return 'skipped';
    }

    const newPath = await copyAndRenameRebFile(filePath, fingerprint);
    insert(parsedReport, parsedParameters, newPath, fingerprint);
    return 'inserted';
  };

  await processRebFiles(folderPath, importFile);
}

export async function runRebuild() {
  const upsertFile = async (
    parsedReport: ParsedRebReport,
    parsedParameters: ParsedRebParameter[],
    fingerprint: string,
    filePath: string,
  ): Promise<'skipped' | 'inserted' | 'updated'> => {
    const existingByPath = collections.RebReport().findOne({ path: filePath });

    if (!existingByPath) {
      insert(parsedReport, parsedParameters, filePath, fingerprint);
      return 'inserted';
    }

    collections.RebReport().update({ ...existingByPath, ...parsedReport, fingerprint });

    const paramCollection = collections.RebParameter();
    paramCollection.find({ reportId: existingByPath.id }).forEach((p) => paramCollection.remove(p));

    for (const param of parsedParameters) {
      paramCollection.insert({
        ...param,
        id: crypto.randomUUID(),
        reportId: existingByPath.id,
      });
    }

    return 'updated';
  };

  await processRebFiles(IMPORTS_PATH, upsertFile);
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
