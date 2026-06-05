import { Tx } from '@src/db/database.ts';
import { ParsedRebReport } from '@src/models/parsed-reb-report.ts';
import { normalizeParameters } from './parameter.helper.ts';
import { ParsedRebPass } from '@src/models/parsed-reb-pass.ts';
import { createHash } from 'crypto';
import { strategyContextService } from './strategy-context.service.ts';
import { parameterSetService } from './parameter-set.service.ts';
import {
  backtestResultsTable,
  backtestsTable,
  RebReportDb,
  rebReportsTable,
} from '@src/db/schema/index.ts';

export const rebReportService = {
  async insertTx(tx: Tx, parsedReport: ParsedRebReport, path: string): Promise<RebReportDb> {
    const fingerprint = buildFingerprint(parsedReport);

    const existing = await tx.query.rebReportsTable.findFirst({
      where: (reports, { eq }) => eq(reports.fingerprint, fingerprint),
    });

    if (existing) {
      return existing;
    }

    const strategyContext = await strategyContextService.findOrCreateTx(
      tx,
      parsedReport.expert,
      parsedReport.symbol,
      parsedReport.timeframe,
      parsedReport.leverage,
      parsedReport.capital,
    );

    const [created] = await tx
      .insert(rebReportsTable)
      .values({
        id: crypto.randomUUID(),
        strategyContextId: strategyContext.id,
        fingerprint,
        importStatus: parsedReport.importStatus,
        path,
        model: parsedReport.model,
        startDate: parsedReport.startDate,
        lastValidatedDate: parsedReport.lastValidatedDate,
        shortTermCount: parsedReport.shortTermCount,
        shortTermDuration: parsedReport.shortTermDuration,
        shortTermUnit: parsedReport.shortTermUnit,
        longTermDuration: parsedReport.longTermDuration,
        longTermUnit: parsedReport.longTermUnit,
      })
      .returning();

    for (const pass of parsedReport.parsedPasses) {
      const parameterSet = await parameterSetService.findOrCreateTx(
        tx,
        parsedReport.expert,
        pass.parameters,
      );

      const backtestId = crypto.randomUUID();

      await tx.insert(backtestsTable).values({
        id: backtestId,
        parameterSetId: parameterSet.id,
        reportId: created.id,
        passNumber: pass.passNumber,
      });

      await tx.insert(backtestResultsTable).values([
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
      ]);
    }

    return created;
  },
};

function normalizePass(pass: ParsedRebPass): string {
  return [pass.passNumber, normalizeParameters(pass.parameters)].join(':');
}

function buildFingerprint(parsed: ParsedRebReport): string {
  const parameters = parsed.parsedPasses.map(normalizePass).sort().join('#');

  const normalized = [
    parsed.importStatus,
    parsed.expert,
    parsed.symbol,
    parsed.timeframe,
    parsed.leverage,
    parsed.capital,
    parsed.model,
    parsed.startDate,
    parsed.lastValidatedDate ?? '',
    parsed.shortTermCount,
    parsed.shortTermDuration,
    parsed.shortTermUnit,
    parsed.longTermDuration,
    parsed.longTermUnit,
    parameters,
  ].join('||');

  return createHash('sha1').update(normalized).digest('hex');
}
