import { RebReport } from '@src/db/models/reb-report.ts';
import { collections } from '../../db/collections.ts';

export const rebReportResolvers = {
  RebReport: {
    strategyContext: (report: RebReport) =>
      collections.StrategyContext().find({ id: report.strategyContextId }),
  },

  Query: {
    rebReports: () => collections.RebReport().find(),
  },
};
