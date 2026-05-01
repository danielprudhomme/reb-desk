import {
  BacktestPassParameter,
  FixedParameter,
  GroupedBacktestPassParameter,
} from './backtest-pass-parameter';
import { BacktestPassResult } from './backtest-pass-result';
import { ExpertAdvisor } from './expert-advisor';
import { TimeUnit } from './time-unit';

export interface BaseBacktestPass {
  expert: ExpertAdvisor;
  symbol: string;
  timeframe: string;
  capital: number;
  startDate: string;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
  shortTermResults: BacktestPassResult[];
  longTermResults: BacktestPassResult[];
}

export interface BacktestPass extends BaseBacktestPass {
  passId: number;
  reportId: string;
  fixedParameters: FixedParameter[];
  parameters: BacktestPassParameter[];
}

export interface GroupedBacktestPass extends BaseBacktestPass {
  passes: { reportId: string; passId: number }[];
  parameters: GroupedBacktestPassParameter[];
}
