import { BacktestThresholdCheck } from './backtest-threshold-check';

export interface BacktestPassAnalysis {
  passId: number;
  ok: boolean;
  checks: BacktestThresholdCheck[];
}
