import { readdir, mkdir, access, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
import crypto from 'node:crypto';
import { IMPORTS_PATH } from '../config.ts';
import { collections } from '../db/collections.ts';
import { ParsedRebReport } from '../models/parsed-reb-report.ts';
import { parseRebReport } from './parser/reb-report.parser.ts';
import expertConst from '@shared/constants/expert.constants.ts';
import { buildRebReportFingerprintHash } from '@src/db/models/reb-report.ts';
import { strategyContextService } from './strategy-context.service.ts';
import { parameterSetService } from './parameter-set.service.ts';

interface ProcessFileRequest {
  parsedReport: ParsedRebReport;
  strategyContextId: string;
  fingerprint: string;
  filePath: string;
}

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
  processFile: (request: ProcessFileRequest) => Promise<'skipped' | 'inserted' | 'updated'>,
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
      const parsedReport = await parseRebReport(filePath);

      // Only import completed reports
      if (parsedReport.importStatus !== 'completed') {
        results.skipped++;
        continue;
      }

      const strategyContext = strategyContextService.findOrCreate(
        parsedReport.expert,
        parsedReport.symbol,
        parsedReport.timeframe,
        parsedReport.leverage,
        parsedReport.capital,
      );
      const fingerprint = buildRebReportFingerprintHash(parsedReport);

      switch (
        await processFile({
          parsedReport,
          strategyContextId: strategyContext.id,
          fingerprint,
          filePath,
        })
      ) {
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
    request: ProcessFileRequest,
  ): Promise<'skipped' | 'inserted' | 'updated'> => {
    const existingByFingerprint = collections
      .RebReport()
      .findOne({ fingerprint: request.fingerprint });

    if (existingByFingerprint) {
      return 'skipped';
    }

    const newPath = await copyAndRenameRebFile(
      request.filePath,
      request.parsedReport,
      request.fingerprint,
    );
    insert(request.parsedReport, newPath, request.strategyContextId, request.fingerprint);
    return 'inserted';
  };

  await processRebFiles(folderPath, importFile);
}

export async function runRebuild() {
  const upsertFile = async (
    request: ProcessFileRequest,
  ): Promise<'skipped' | 'inserted' | 'updated'> => {
    const existingByPath = collections.RebReport().findOne({ path: request.filePath });

    if (!existingByPath) {
      insert(
        request.parsedReport,
        request.filePath,
        request.strategyContextId,
        request.fingerprint,
      );
      return 'inserted';
    }

    const parsed = request.parsedReport;

    // 1. update report
    collections.RebReport().update({
      ...existingByPath,
      strategyContextId: request.strategyContextId,
      fingerprint: request.fingerprint,
      importStatus: parsed.importStatus,
      model: parsed.model,
      startDate: parsed.startDate,
      lastValidatedDate: parsed.lastValidatedDate,
      shortTermCount: parsed.shortTermCount,
      shortTermDuration: parsed.shortTermDuration,
      shortTermUnit: parsed.shortTermUnit,
      longTermDuration: parsed.longTermDuration,
      longTermUnit: parsed.longTermUnit,
    });

    const reportId = existingByPath.id;

    // 2. delete old backtests
    const backtests = collections.Backtest().find({ reportId });

    for (const bt of backtests) {
      collections.Backtest().remove(bt);
    }

    // 3. recreate backtests + parameterSets
    for (const { passNumber, parameters } of parsed.parsedPasses) {
      const parameterSet = parameterSetService.findOrCreate(request.strategyContextId, parameters);

      createBacktest(reportId, request.strategyContextId, parameterSet.id, passNumber);
    }

    return 'updated';
  };

  await processRebFiles(IMPORTS_PATH, upsertFile);
}

function insert(
  parsedReport: ParsedRebReport,
  newPath: string,
  strategyContextId: string,
  fingerprint: string,
) {
  const reportId = crypto.randomUUID();

  collections.RebReport().insert({
    id: reportId,
    strategyContextId,
    fingerprint,
    importStatus: parsedReport.importStatus,
    path: newPath,
    model: parsedReport.model,
    startDate: parsedReport.startDate,
    lastValidatedDate: parsedReport.lastValidatedDate,
    shortTermCount: parsedReport.shortTermCount,
    shortTermDuration: parsedReport.shortTermDuration,
    shortTermUnit: parsedReport.shortTermUnit,
    longTermDuration: parsedReport.longTermDuration,
    longTermUnit: parsedReport.longTermUnit,
  });

  for (const { passNumber, parameters } of parsedReport.parsedPasses) {
    // 1. get or create ParameterSet
    const parameterSet = parameterSetService.findOrCreate(strategyContextId, parameters);

    // 2. create Backtest
    createBacktest(reportId, strategyContextId, parameterSet.id, passNumber);
  }
}

function createBacktest(
  reportId: string,
  strategyContextId: string,
  parameterSetId: string,
  passNumber: number,
) {
  const existing = collections.Backtest().findOne({
    reportId,
    parameterSetId,
    passNumber,
  });

  if (existing) return existing;

  const backtest = {
    id: crypto.randomUUID(),
    reportId,
    strategyContextId,
    parameterSetId,
    passNumber,
  };

  collections.Backtest().insert(backtest);

  return backtest;
}

function replaceValue(lines: string[], key: string, newValue: string) {
  const idx = lines.findIndex((l) => l.trim() === key);
  if (idx !== -1 && lines[idx + 1]) {
    lines[idx + 1] = newValue;
  }
}

async function copyAndRenameRebFile(
  filePath: string,
  parsedReport: ParsedRebReport,
  fingerprint: string,
) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const expertName = expertConst.EXPERT_NAMES[parsedReport.expert].replaceAll(' ', '');
  const startDate = parsedReport.startDate.replaceAll('-', '').substring(2);
  const shortTerm = `${parsedReport.shortTermCount}x${parsedReport.shortTermDuration}${parsedReport.shortTermUnit.toString()[0]}`;
  const longTerm = `${parsedReport.longTermDuration}${parsedReport.longTermUnit.toString()[0]}`;
  const newProjectName = `${parsedReport.symbol}-${parsedReport.timeframe}-${expertName}-${parsedReport.capital}-${startDate}-${shortTerm}-${longTerm}-${fingerprint}`;

  replaceValue(lines, 'NOM PROJET :', newProjectName);

  const newContent = lines.join('\n');

  const newPath = join(IMPORTS_PATH, `${newProjectName}.reb`);

  await writeFile(newPath, newContent, 'utf-8');

  return newPath;
}
