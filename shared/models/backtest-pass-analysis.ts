import { BacktestThresholdCheck } from './backtest-threshold-check';
import { GroupedBacktestPass } from './backtest-pass';

export interface GroupedBacktestPassAnalysis extends GroupedBacktestPass {
  ok: boolean;
  checks: BacktestThresholdCheck[];
  score: number;
}
