import { collections } from '../../db/collections.ts';

export const rebReportResolvers = {
  // RebReport: {
  //   parameters: (report: RebReport) => collections.RebParameter().find({ reportId: report.id }),
  // },

  Query: {
    rebReports: () => collections.RebReport().find(),
  },
};
