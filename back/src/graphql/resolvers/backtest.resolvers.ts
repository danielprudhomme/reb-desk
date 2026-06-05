import { db } from '@src/db/database.ts';

export const backtestResolvers = {
  Query: {
    backtests: () =>
      db.query.backtestsTable.findMany({ with: { parameterSet: true, results: true } }),
  },
};
