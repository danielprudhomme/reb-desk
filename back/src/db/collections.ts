import { RebReport } from '../db/models/reb-report.ts';
import { db } from './database.ts';
import { RebParameter } from '../db/models/reb-parameter.ts';

function getOrCreateCollection<T extends object>(
  name: string,
  indices: (keyof T)[] = [],
  unique: (keyof T)[] = [],
) {
  let collection = db.getCollection<T>(name);

  if (!collection) {
    collection = db.addCollection<T>(name, { indices, unique });
  }

  return collection;
}

export const collections = {
  RebReport: () =>
    getOrCreateCollection<RebReport>('rebReports', ['id', 'symbol', 'expert'], ['fingerprint']),
  RebParameter: () => getOrCreateCollection<RebParameter>('rebParameters', ['reportId', 'name']),

  CreateAll: () => {
    collections.RebReport();
    collections.RebParameter();
  },
};
