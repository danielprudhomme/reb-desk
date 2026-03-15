import { randomUUID } from 'node:crypto';
import type { RebReport } from '@shared/models/reb-report.ts';
import { rebReportCollection } from 'src/modules/reb-report/reb-report.collection.ts';

export const rebReportResolvers = {
  RebReport: {
    mtimeDate: (report: RebReport) => {
      return new Date(report.mtime).toISOString();
    },
  },

  Query: {
    rebReports: () => rebReportCollection().find(),
    rebReport: (_: unknown, { id }: { id: string }) => rebReportCollection().findOne({ id }),
  },

  Mutation: {
    createRebReport: (_: unknown, { input }: { input: Omit<RebReport, 'id'> }) => {
      const report: RebReport = { ...input, id: randomUUID(), mtime: Date.now() };
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
