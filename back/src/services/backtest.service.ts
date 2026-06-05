import { db } from '@src/db/database.ts';
import { backtestsTable, rebReportsTable } from '@src/db/schema/index.ts';
import { eq } from 'drizzle-orm';
import { parameterSetService } from './parameter-set.service.ts';
import { Backtest } from '@shared/models/backtest.ts';

export const backtestService = {
  async getBacktests({
    reportId,
    strategyContextId,
  }: {
    reportId?: string;
    strategyContextId?: string;
  }): Promise<Backtest[]> {
    if (!reportId && !strategyContextId) {
      throw new Error('reportId or strategyContextId must be provided');
    }

    const condition = reportId
      ? eq(backtestsTable.reportId, reportId)
      : eq(rebReportsTable.strategyContextId, strategyContextId!);

    const ids = (
      await db
        .select({ id: backtestsTable.id })
        .from(backtestsTable)
        .innerJoin(rebReportsTable, eq(backtestsTable.reportId, rebReportsTable.id))
        .where(condition)
    ).map((x) => x.id);

    const backtests = (
      await db.query.backtestsTable.findMany({
        where: (backtestsTable, { inArray }) => inArray(backtestsTable.id, ids),
        with: {
          parameterSet: true,
          results: true,
          report: {
            with: {
              strategyContext: true,
            },
          },
        },
      })
    ).map((backtest) => ({
      reportId: backtest.reportId,
      id: backtest.id,
      parameterSetId: backtest.parameterSetId,
      passNumber: backtest.passNumber,

      parameterSet: parameterSetService.mapDbToModel(backtest.parameterSet),

      strategyContext: backtest.report.strategyContext,

      shortTermResults: backtest.results.filter((result) => result.type === 'short_term'),

      longTermResults: backtest.results.filter((result) => result.type === 'long_term'),
    }));

    return backtests;
  },
};
