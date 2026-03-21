import { BacktestPassParameter } from './backtest-pass-parameter';
import { BacktestPassResult } from './backtest-pass-result';

export interface BacktestPass {
  id: number;
  parameters: BacktestPassParameter[];
  shortTermResults: BacktestPassResult[];
  longTermResults: BacktestPassResult[];
}
