import { Tx } from '@src/db/database.ts';
import { RebReport, rebReports } from '@src/db/schema/index.ts';
import { ParsedRebReport } from '@src/models/parsed-reb-report.ts';
import { normalizeParameters } from './parameter.helper.ts';
import { ParsedRebPass } from '@src/models/parsed-reb-pass.ts';
import { createHash } from 'crypto';
import { strategyContextService } from './strategy-context.service.ts';

export const rebReportService = {
  async insertTx(tx: Tx, parsedReport: ParsedRebReport, path: string): Promise<RebReport> {
    const fingerprint = buildFingerprint(parsedReport);

    const existing = await tx.query.rebReports.findFirst({
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
      .insert(rebReports)
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
