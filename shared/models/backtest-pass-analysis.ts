import { BacktestPass } from 'src/models/backtest-pass';
import { BacktestThresholdCheck } from './backtest-threshold-check';

export interface BacktestPassAnalysis extends BacktestPass {
  ok: boolean;
  checks: BacktestThresholdCheck[];
}
