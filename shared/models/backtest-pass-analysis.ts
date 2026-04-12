import { BacktestThresholdCheck } from './backtest-threshold-check';
import { TimeUnit } from './time-unit';
import { ExpertAdvisor } from './expert-advisor';
import { BacktestPassResult } from './backtest-pass-result';
import { BacktestPassParameter } from './backtest-pass-parameter';

export interface BacktestPassAnalysis {
  ok: boolean;
  checks: BacktestThresholdCheck[];
  score: number;
  reportId: string;
  passIds: number[];
  // parameters: BacktestPassParameter[];
  longTermResults: BacktestPassResult[];
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
