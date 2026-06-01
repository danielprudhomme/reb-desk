import { db } from '@src/db/database.ts';

export const rebReportResolvers = {
  Query: {
    rebReports: () =>
      db.query.rebReports.findMany({
        with: {
          strategyContext: true,
          backtests: true,
        },
      }),
  },
};
