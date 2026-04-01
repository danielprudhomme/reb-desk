import { BacktestThresholdCheck } from './backtest-threshold-check';
import { BacktestPass } from './backtest-pass';
import { TimeUnit } from './time-unit';

export interface BacktestPassAnalysis extends BacktestPass {
  ok: boolean;
  checks: BacktestThresholdCheck[];
  score: number;
  capital: number;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
}
