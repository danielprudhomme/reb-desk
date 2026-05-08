import {
  BacktestPassParameter,
  FixedParameter,
  GroupedBacktestPassParameter,
} from './backtest-pass-parameter';
import { BacktestPassResult } from './backtest-pass-result';

export interface BaseBacktestPass {
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
