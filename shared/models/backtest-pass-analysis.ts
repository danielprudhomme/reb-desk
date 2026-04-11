import { BacktestThresholdCheck } from './backtest-threshold-check';
import { BacktestPass } from './backtest-pass';
import { TimeUnit } from './time-unit';
import { ExpertAdvisor } from './expert-advisor';

export interface BacktestPassAnalysis extends BacktestPass {
  ok: boolean;
  checks: BacktestThresholdCheck[];
  score: number;
  reportId: string;
  expert: ExpertAdvisor;
  symbol: string;
  timeframe: string;
  capital: number;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
}
