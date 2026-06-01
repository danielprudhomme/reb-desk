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

      await db.transaction((tx) => {
        return rebReportService.insertTx(tx, parsedReport, newPath);
      });
    } catch (err) {
      results.errors.push(`${filePath}: ${String(err)}`);
    }
  }
}

// async function processRebFiles(
//   folderPath: string
// ) {
//   await ensureDirectory(IMPORTS_PATH);

//   const files = await findRebFiles(folderPath);

//   const results = {
//     skipped: 0,
//     inserted: 0,
//     updated: 0,
//     errors: [] as string[],
//   };

//   for (const filePath of files) {
//     try {
//       const parsedReport = await parseRebReport(filePath);

//       // Only import completed reports
//       if (parsedReport.importStatus !== 'completed') {
//         results.skipped++;
//         continue;
//       }

//     //   // TODO : do everything in one tx
//     //   const strategyContext = await db.transaction((tx) =>
//     //     strategyContextService.findOrCreateTx(
//     //       tx,
//     //       parsedReport.expert,
//     //       parsedReport.symbol,
//     //       parsedReport.timeframe,
//     //       parsedReport.leverage,
//     //       parsedReport.capital,
//     //     ),
//     //   );

//     //   switch (
//     //     await processFile({
//     //       parsedReport,
//     //       strategyContextId: strategyContext.id,
//     //       filePath,
//     //     })
//     //   ) {
//     //     case 'updated':
//     //       results.updated++;
//     //       break;
//     //     case 'inserted':
//     //       results.inserted++;
//     //       break;
//     //     case 'skipped':
//     //       results.skipped++;
//     //       break;
//     //   }
//     } catch (err) {
//       results.errors.push(`${filePath}: ${String(err)}`);
//     }
//   }

//   return results;
// }

// export async function runImportOLD(folderPath: string):  {
//   const importFile = async (
//     request: ProcessFileRequest,
//   ): Promise<'skipped' | 'inserted' | 'updated'> => {
//     const existingByFingerprint = await db.query.rebReports.findFirst({
//       where: (reports, { eq }) => eq(reports.fingerprint, request.fingerprint),
//     });

//     if (existingByFingerprint) {
//       return 'skipped';
//     }

//     const newPath = await copyAndRenameRebFile(
//       request.filePath,
//       request.parsedReport,
//       request.fingerprint,
//     );
//     insert(request.parsedReport, newPath, request.strategyContextId, request.fingerprint);
//     return 'inserted';
//   };

//   await processRebFiles(folderPath, importFile);
// }

// // export async function runRebuild() {
// //   const upsertFile = async (
// //     request: ProcessFileRequest,
// //   ): Promise<'skipped' | 'inserted' | 'updated'> => {
// //     const existingByPath = await db.query.rebReports.findFirst({
// //       where: (reports, { eq }) => eq(reports.path, request.filePath),
// //     });

// //     if (!existingByPath) {
// //       insert(
// //         request.parsedReport,
// //         request.filePath,
// //         request.strategyContextId,
// //         request.fingerprint,
// //       );
// //       return 'inserted';
// //     }

// // const parsed = request.parsedReport;

// // 1. update report

// // collections.RebReport().update({
// //   ...existingByPath,
// //   strategyContextId: request.strategyContextId,
// //   fingerprint: request.fingerprint,
// //   importStatus: parsed.importStatus,
// //   model: parsed.model,
// //   startDate: parsed.startDate,
// //   lastValidatedDate: parsed.lastValidatedDate ?? null,
// //   shortTermCount: parsed.shortTermCount,
// //   shortTermDuration: parsed.shortTermDuration,
// //   shortTermUnit: parsed.shortTermUnit,
// //   longTermDuration: parsed.longTermDuration,
// //   longTermUnit: parsed.longTermUnit,
// // });

// // const reportId = existingByPath.id;

// // // 2. delete old backtests
// // const backtests = collections.Backtest().find({ reportId });

// // for (const bt of backtests) {
// //   collections.Backtest().remove(bt);
// // }

// // // 3. recreate backtests + parameterSets
// // for (const { passNumber, parameters } of parsed.parsedPasses) {
// //   const parameterSet = parameterSetService.findOrCreate(request.strategyContextId, parameters);

// //   createBacktest(reportId, request.strategyContextId, parameterSet.id, passNumber);
// // }

// //     return 'updated';
// //   };

// //   await processRebFiles(IMPORTS_PATH, upsertFile);
// // }

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
