import { RebReport } from '@shared/models/reb-report.ts';
import { db } from './database.ts';
import { RebParameter } from '@shared/models/reb-parameter.ts';

function getOrCreateCollection<T extends object>(name: string, indices: (keyof T)[] = []) {
  let collection = db.getCollection<T>(name);

  if (!collection) {
    collection = db.addCollection<T>(name, { indices });
  }

  return collection;
}

export const collections = {
  RebReport: () => getOrCreateCollection<RebReport>('rebReports', ['id', 'symbol', 'expert']),
  RebParameter: () => getOrCreateCollection<RebParameter>('rebParameters', ['reportId', 'name']),

  CreateAll: () => {
    collections.RebReport();
    collections.RebParameter();
  },
};
