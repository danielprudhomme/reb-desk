import { GroupedBacktestPassParameter } from './backtest-pass-parameter';
import { BacktestPassResult } from './backtest-pass-result';
import { Parameter } from './parameter';

export interface BacktestWithResults {
  id: string;
  strategyContextId: string;
  parameterSetId: string;
  reportId: string;
  passNumber: number;
  shortTermResults: BacktestPassResult[];
  longTermResults: BacktestPassResult[];
}

export interface BaseBacktestPass {
  shortTermResults: BacktestPassResult[];
  longTermResults: BacktestPassResult[];
}

export interface BacktestPass extends BaseBacktestPass {
  passId: number;
  reportId: string;
  parameters: Parameter[];
}

export interface GroupedBacktestPass extends BaseBacktestPass {
  passes: { reportId: string; passId: number }[];
  parameters: GroupedBacktestPassParameter[];
}
