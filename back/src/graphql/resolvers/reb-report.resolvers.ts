import { randomUUID } from 'node:crypto';
import type { RebReport } from 'src/models/reb-report.ts';
import { collections } from 'src/db/collections.ts';

export const rebReportResolvers = {
  RebReport: {
    parameters: (report: RebReport) => {
      return collections.RebParameter().find({ reportId: report.id });
    },
  },

  Query: {
    rebReports: () => collections.RebReport().find(),
    rebReport: (_: unknown, { id }: { id: string }) => collections.RebReport().findOne({ id }),
  },

  Mutation: {
    createRebReport: (_: unknown, { input }: { input: Omit<RebReport, 'id'> }) => {
      const report: RebReport = { ...input, id: randomUUID(), mtime: Date.now() };
      return collections.RebReport().insert(report);
    },

    deleteRebReport: (_: unknown, { id }: { id: string }) => {
      const col = collections.RebReport();
      const report = col.findOne({ id });

      if (!report) return false;

      col.remove(report);
      return true;
    },
  },
};
