import { BacktestPass } from '@shared/models/backtest-pass.ts';

export type ParsedRebPass = Omit<
  BacktestPass,
  | 'reportId'
  | 'expert'
  | 'symbol'
  | 'timeframe'
  | 'capital'
  | 'startDate'
  | 'shortTermCount'
  | 'shortTermDuration'
  | 'shortTermUnit'
  | 'longTermDuration'
  | 'longTermUnit'
>;
