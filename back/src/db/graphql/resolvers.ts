import { randomUUID } from 'node:crypto';
import type { RebReport } from '@shared/models/reb-report.ts';
import { getRebReports } from '../database.ts';

export const resolvers = {
  Query: {
    rebReports: () => {
      return getRebReports().find();
    },

    rebReport: (_: unknown, { id }: { id: string }) => {
      return getRebReports().findOne({ id });
    },
  },

  Mutation: {
    createRebReport: (_: unknown, { input }: { input: Omit<RebReport, 'id'> }) => {
      const report: RebReport = {
        id: randomUUID(),
        ...input,
      };

      return getRebReports().insert(report);
    },

    deleteRebReport: (_: unknown, { id }: { id: string }) => {
      const col = getRebReports();
      const report = col.findOne({ id });

      if (!report) return false;

      col.remove(report);

      return true;
    },
  },
};
