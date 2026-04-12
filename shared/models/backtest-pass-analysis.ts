import { BacktestThresholdCheck } from './backtest-threshold-check';
import { TimeUnit } from './time-unit';
import { ExpertAdvisor } from './expert-advisor';
import { BacktestPassResult } from './backtest-pass-result';
import {
  BacktestPassParameter,
  FixedParameter,
  GroupedBacktestPassParameter,
} from './backtest-pass-parameter';

interface BaseBacktestPassAnalysis {
  ok: boolean;
  checks: BacktestThresholdCheck[];
  fixedParameters: FixedParameter[];
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

export interface BacktestPassAnalysis extends BaseBacktestPassAnalysis {
  reportId: string;
  passId: number;
  parameters: BacktestPassParameter[];
}

export interface GroupedBacktestPassAnalysis extends BaseBacktestPassAnalysis {
  score: number;
  passes: { reportId: string; passId: number }[];
  parameters: GroupedBacktestPassParameter[];
}
