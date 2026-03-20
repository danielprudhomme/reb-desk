import { BacktestThresholdType } from './backtest-threshold-type';

export interface BacktestThresholdCheck {
  type: BacktestThresholdType;
  ok: boolean;
  worstValue: number;
  rate: number;
  requiredRate: number;
}
