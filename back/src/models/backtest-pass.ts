import { BacktestPassParameter } from './backtest-pass-parameter.ts';
import { BacktestPassResult } from './backtest-pass-result.ts';

export interface BacktestPass {
  id: number;
  parameters: BacktestPassParameter[];
  shortTermResults: BacktestPassResult[];
  longTermResults: BacktestPassResult[];
}
