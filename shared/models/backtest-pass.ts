import { BacktestPassParameter, FixedParameter } from './backtest-pass-parameter';
import { BacktestPassResult } from './backtest-pass-result';

export interface BacktestPass {
  id: number;
  fixedParameters: FixedParameter[];
  parameters: BacktestPassParameter[];
  shortTermResults: BacktestPassResult[];
  longTermResults: BacktestPassResult[];
}
