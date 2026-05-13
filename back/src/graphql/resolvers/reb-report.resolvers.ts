import type { RebReport } from '../../db/models/reb-report.ts';
import { collections } from '../../db/collections.ts';

export const rebReportResolvers = {
  RebReport: {
    parameters: (report: RebReport) => {
      return collections.RebParameter().find({ reportId: report.id });
    },
  },

  Query: {
    rebReports: () => collections.RebReport().find(),
  },
};
