import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';

export type ValuesByThresholdType = Record<
  BacktestThresholdType,
  { worstValues: number[]; min: number; max: number }
>;
