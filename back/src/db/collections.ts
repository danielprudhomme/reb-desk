import { RebReport } from '../db/models/reb-report.ts';
import { db } from './database.ts';
import { Account } from './models/account.ts';
import { Robot } from './models/robot.ts';
import { Backtest } from './models/backtest.ts';
import { ParameterSet } from './models/parameter-set.ts';
import { StrategyContext } from './models/strategy-context.ts';

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
  Account: () => getOrCreateCollection<Account>('accounts', ['id', 'name']),

  Backtest: () =>
    getOrCreateCollection<Backtest>('backtests', [
      'id',
      'parameterSetId',
      'reportId',
      'strategyContextId',
    ]),

  ParameterSet: () =>
    getOrCreateCollection<ParameterSet>(
      'parameterSets',
      ['id', 'strategyContextId'],
      ['fingerprint'],
    ),

  RebReport: () =>
    getOrCreateCollection<RebReport>('rebReports', ['id', 'strategyContextId'], ['fingerprint']),

  Robot: () =>
    getOrCreateCollection<Robot>('robots', [
      'id',
      'accountId',
      'parameterSetId',
      'strategyContextId',
    ]),

  StrategyContext: () =>
    getOrCreateCollection<StrategyContext>(
      'strategyContexts',
      ['id', 'expert', 'symbol', 'timeframe'],
      ['id'],
    ),

  CreateAll: () => {
    collections.Account();
    collections.Backtest();
    collections.ParameterSet();
    collections.RebReport();
    collections.Robot();
    collections.StrategyContext();
  },
};
