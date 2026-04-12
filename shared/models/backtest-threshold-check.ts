import { BacktestThresholdType } from './backtest-threshold-type';

export interface BacktestThresholdCheck {
  type: BacktestThresholdType;
  ok: boolean;
  worstValue: number;
  averageValue: number;
  bestValue: number;
  rate: number;
  requiredRate: number;
  score: number;
}
