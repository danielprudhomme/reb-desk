import { randomUUID } from 'node:crypto';
import type { RebReport } from '@shared/models/reb-report.ts';
import { rebReportCollection } from 'src/modules/reb-report/reb-report.collection.ts';
import { rebParameterCollection } from '../reb-parameter/reb-parameter.collection.ts';

export const rebReportResolvers = {
  RebReport: {
    parameters: (report: RebReport) => {
      return rebParameterCollection().find({ reportId: report.id });
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
