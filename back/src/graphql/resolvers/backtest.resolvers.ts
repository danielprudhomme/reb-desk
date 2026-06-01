import { db } from '@src/db/database.ts';

export const backtestResolvers = {
  Query: {
    backtests: () => db.query.backtests.findMany({ with: { parameterSet: true } }),
  },
};
