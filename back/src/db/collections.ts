import { RebReport } from '../db/models/reb-report.ts';
import { db } from './database.ts';
import { RebParameter } from '../db/models/reb-parameter.ts';
import { Account } from './models/account.ts';
import { Robot } from './models/robot.ts';

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

  Account: () => getOrCreateCollection<Account>('accounts', ['id', 'name']),

  Robot: () =>
    getOrCreateCollection<Robot>('robots', [
      'id',
      'accountId',
      'expert',
      'symbol',
      'timeframe',
      'signature',
    ]),

  CreateAll: () => {
    collections.RebReport();
    collections.RebParameter();
    collections.Account();
    collections.Robot();
  },
};
