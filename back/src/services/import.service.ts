import { readdir, mkdir, access, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
import { IMPORTS_PATH } from '../config.ts';
import { parseRebReport } from './parser/reb-report.parser.ts';
import expertConst from '@shared/constants/expert.constants.ts';
import { ParsedRebReport } from '@src/models/parsed-reb-report.ts';
import { db } from '@src/db/database.ts';
import { rebReportService } from './reb-report.service.ts';

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

export async function runImport(folderPath: string): Promise<void> {
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
      const parsedReport = await parseRebReport(filePath);

      if (parsedReport.importStatus !== 'completed') {
        results.skipped++;
        continue;
      }

      const { newPath } = await moveFileToImportedFolder(filePath, parsedReport);

      await db.transaction(async (tx) => {
        await rebReportService.insertTx(tx, parsedReport, newPath);
      });
    } catch (err) {
      results.errors.push(`${filePath}: ${String(err)}`);
    }
  }
}

function replaceValue(lines: string[], key: string, newValue: string) {
  const idx = lines.findIndex((l) => l.trim() === key);
  if (idx !== -1 && lines[idx + 1]) {
    lines[idx + 1] = newValue;
  }
}

async function moveFileToImportedFolder(
  filePath: string,
  parsedReport: ParsedRebReport,
): Promise<{ newPath: string }> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const expertName = expertConst.EXPERT_NAMES[parsedReport.expert].replaceAll(' ', '');
  const startDate = parsedReport.startDate.replaceAll('-', '').substring(2);
  const shortTerm = `${parsedReport.shortTermCount}x${parsedReport.shortTermDuration}${parsedReport.shortTermUnit.toString()[0]}`;
  const longTerm = `${parsedReport.longTermDuration}${parsedReport.longTermUnit.toString()[0]}`;
  const currentDate = formatDateCompact();
  const newProjectName = `${parsedReport.symbol}-${parsedReport.timeframe}-${expertName}-${parsedReport.capital}-${startDate}-${shortTerm}-${longTerm}-${currentDate}`;

  replaceValue(lines, 'NOM PROJET :', newProjectName);

  const newContent = lines.join('\n');
  const newPath = join(IMPORTS_PATH, `${newProjectName}.reb`);

  await writeFile(newPath, newContent, 'utf-8');

  return { newPath };
}

function formatDateCompact(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}
