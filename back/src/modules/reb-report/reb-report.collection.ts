import { RebReport } from '@shared/models/reb-report.ts';
import { db } from '../../db/database.ts';

export function rebReportCollection() {
  return db.getCollection('rebReports');
}

export function createRebReportCollection() {
  const rebReports = db.getCollection<RebReport>('rebReports');

  if (!rebReports) {
    db.addCollection<RebReport>('rebReports', {
      indices: ['id', 'symbol', 'expert'],
    });
  }
}
