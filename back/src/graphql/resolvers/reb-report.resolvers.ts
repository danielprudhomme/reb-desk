import { RebReport } from '@src/db/models/reb-report.ts';
import { collections } from '../../db/collections.ts';

export const rebReportResolvers = {
  RebReport: {
    strategyContext: (report: RebReport) =>
      collections.StrategyContext().findOne({ id: report.strategyContextId }),
    backtests: (report: RebReport) => collections.Backtest().find({ reportId: report.id }),
  },

  Query: {
    rebReports: () => collections.RebReport().find(),
  },
};
