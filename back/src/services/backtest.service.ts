import { db } from '@src/db/database.ts';
import { backtestsTable, rebReportsTable } from '@src/db/schema/index.ts';
import { and, eq } from 'drizzle-orm';
import { parameterSetService } from './parameter-set.service.ts';
import { Backtest } from '@shared/models/backtest.ts';
import { TimeUnit } from '@shared/models/time-unit.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { Timeframe } from '@shared/models/timeframe.ts';

export const backtestService = {
  async getBacktests({
    reportId,
    strategyContext,
  }: {
    reportId?: string;
    strategyContext?: {
      expert: ExpertAdvisor;
      symbol: Symbol;
      timeframe: Timeframe;
      leverage: number;
      capital: number;
    };
  }): Promise<Backtest[]> {
    if (!reportId && !strategyContext) {
      throw new Error('reportId or strategyContext must be provided');
    }

    const condition = reportId
      ? eq(backtestsTable.reportId, reportId)
      : and(
          eq(rebReportsTable.expert, strategyContext!.expert),
          eq(rebReportsTable.symbol, strategyContext!.symbol),
          eq(rebReportsTable.timeframe, strategyContext!.timeframe),
          eq(rebReportsTable.leverage, strategyContext!.leverage),
          eq(rebReportsTable.capital, strategyContext!.capital),
        );

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
          report: true,
        },
      })
    ).map((backtest) => ({
      reportId: backtest.reportId,
      id: backtest.id,
      expert: backtest.report.expert as ExpertAdvisor,
      symbol: backtest.report.symbol as Symbol,
      timeframe: backtest.report.timeframe as Timeframe,
      leverage: backtest.report.leverage,
      capital: backtest.report.capital,
      parameterSetId: backtest.parameterSetId,
      passNumber: backtest.passNumber,
      parameterSet: parameterSetService.mapDbToModel(backtest.parameterSet),
      longTermUnit: backtest.report.longTermUnit as TimeUnit,
      longTermDuration: backtest.report.longTermDuration,
      shortTermResults: backtest.results.filter((result) => result.type === 'short_term'),
      longTermResults: backtest.results.filter((result) => result.type === 'long_term'),
    }));

    return backtests;
  },
};
