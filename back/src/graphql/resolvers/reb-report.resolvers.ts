import { db } from '@src/db/database.ts';

export const rebReportResolvers = {
  Query: {
    rebReports: () =>
      db.query.rebReportsTable.findMany({
        with: {
          backtests: true,
        },
      }),
  },
};
