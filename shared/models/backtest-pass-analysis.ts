import { BacktestThresholdCheck } from './backtest-threshold-check';
import { BacktestPass } from './backtest-pass';

export interface BacktestPassAnalysis extends BacktestPass {
  ok: boolean;
  checks: BacktestThresholdCheck[];
  score: number;
}
