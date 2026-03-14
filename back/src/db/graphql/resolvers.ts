import { randomUUID } from 'node:crypto';
import type { RebReport } from '@shared/models/reb-report.ts';
import { rebReportCollection } from '../database.ts';

export const resolvers = {
  Query: {
    rebReports: () => {
      return rebReportCollection().find();
    },

    rebReport: (_: unknown, { id }: { id: string }) => {
      return rebReportCollection().findOne({ id });
    },
  },

  Mutation: {
    createRebReport: (_: unknown, { input }: { input: Omit<RebReport, 'id'> }) => {
      const report: RebReport = {
        id: randomUUID(),
        ...input,
      };

      return rebReportCollection().insert(report);
    },

    deleteRebReport: (_: unknown, { id }: { id: string }) => {
      const col = rebReportCollection();
      const report = col.findOne({ id });

      if (!report) return false;

      col.remove(report);

      return true;
    },
  },
};
