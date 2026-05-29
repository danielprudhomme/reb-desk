import { BacktestPassResult } from '@shared/models/backtest-pass-result.ts';
import { Parameter } from '@shared/models/parameter.ts';

export interface ParsedRebPass {
  passNumber: number;
  parameters: Parameter[];
  shortTermResults: BacktestPassResult[];
  longTermResults: BacktestPassResult[];
}
