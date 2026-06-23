import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { IMPORTS_PATH } from '../config.ts';
import { parseRebReport } from './parser/reb-report.parser.ts';
import { db } from '@src/db/database.ts';
import { rebReportService } from './reb-report.service.ts';
import { logService } from './log.service.ts';
import { strategyContextService } from './strategy-context.service.ts';
import { parameterSetService } from './parameter-set.service.ts';
import { backtestsTable } from '@src/db/schema/backtest.ts';
import { backtestResultsTable } from '@src/db/schema/backtest-result.ts';
import { fileService } from './file.service.ts';

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

export async function runImport(
  folderPath: string,
  callback?: (reportId: string, selectedPassNumber: number) => Promise<void>,
): Promise<void> {
  await fileService.ensureDirectory(IMPORTS_PATH);

  const files = await findRebFiles(folderPath);

  logService.info('import', `Started on ${files.length} files.`);

  const results = {
    skipped: 0,
    inserted: 0,
    updated: 0,
    errors: [] as string[],
  };

  let index = 0;
  for (const filePath of files) {
    index++;

    try {
      logService.info('import', `Import file ${index} / ${files.length}`);
      const parsedReport = await parseRebReport(filePath);

      if (parsedReport.importStatus !== 'completed') {
        results.skipped++;
        logService.info('import', `File skipped (not completed)`);
        continue;
      }

      const fingerprint = rebReportService.buildFingerprint({
        ...parsedReport,
        passes: parsedReport.parsedPasses,
      });

      const existingReport = await db.query.rebReportsTable.findFirst({
        where: (reports, { eq }) => eq(reports.fingerprint, fingerprint),
      });

      if (existingReport) {
        results.skipped++;
        logService.info('import', 'File skipped (already imported)');

        if (callback && parsedReport.selectedPassNumber) {
          await callback(existingReport.id, parsedReport.selectedPassNumber);
        }

        continue;
      }

      const newProjectName = rebReportService.generateProjectName(parsedReport);
      const newPath = `${newProjectName}.reb`;

      const createdReportId = db.transaction((tx) => {
        const strategyContext = strategyContextService.findOrCreateTx(
          tx,
          parsedReport.expert,
          parsedReport.symbol,
          parsedReport.timeframe,
          parsedReport.leverage,
          parsedReport.capital,
        );

        const rebReport = rebReportService.insertTx(tx, {
          id: crypto.randomUUID(),
          strategyContextId: strategyContext.id,
          fingerprint,
          importStatus: parsedReport.importStatus,
          path: newPath,
          model: parsedReport.model,
          startDate: parsedReport.startDate,
          lastValidatedDate: parsedReport.lastValidatedDate ?? null,
          shortTermCount: parsedReport.shortTermCount,
          shortTermDuration: parsedReport.shortTermDuration,
          shortTermUnit: parsedReport.shortTermUnit,
          longTermDuration: parsedReport.longTermDuration,
          longTermUnit: parsedReport.longTermUnit,
        });

        for (const pass of parsedReport.parsedPasses) {
          const parameterSet = parameterSetService.findOrCreateTx(
            tx,
            parsedReport.expert,
            pass.parameters,
          );

          const backtestId = crypto.randomUUID();

          tx.insert(backtestsTable)
            .values({
              id: backtestId,
              parameterSetId: parameterSet.id,
              reportId: rebReport.id,
              passNumber: pass.passNumber,
            })
            .execute();

          tx.insert(backtestResultsTable)
            .values([
              ...pass.shortTermResults.map((result, position) => ({
                backtestId,
                type: 'short_term' as const,
                position,
                ...result,
              })),

              ...pass.longTermResults.map((result, position) => ({
                backtestId,
                type: 'long_term' as const,
                position,
                ...result,
              })),
            ])
            .execute();
        }

        return rebReport.id;
      });

      await moveFileToImportedFolder(filePath, newProjectName);

      if (callback && parsedReport.selectedPassNumber) {
        await callback(createdReportId, parsedReport.selectedPassNumber);
      }

      logService.info('import', 'File imported succesfully', `File path: : ${newPath}`);
    } catch (err) {
      logService.error('import', 'File import failed', String(err));
      results.errors.push(`${filePath}: ${String(err)}`);
    }
  }

  logService.info('import', 'Import finished', results);
}

function replaceValue(lines: string[], key: string, newValue: string) {
  const idx = lines.findIndex((l) => l.trim() === key);
  if (idx !== -1 && lines[idx + 1]) {
    lines[idx + 1] = newValue;
  }
}

async function moveFileToImportedFolder(filePath: string, newProjectName: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  replaceValue(lines, 'NOM PROJET :', newProjectName);

  const newContent = lines.join('\n');
  const newPath = join(IMPORTS_PATH, `${newProjectName}.reb`);

  await writeFile(newPath, newContent, 'utf-8');
}
