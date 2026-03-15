import { db } from '../database.ts';

export function rebReportCollection() {
  return db.getCollection('rebReports');
}
