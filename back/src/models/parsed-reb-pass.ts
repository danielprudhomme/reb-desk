import { Parameter } from '@shared/models/parameter.ts';

export interface ParsedRebPass {
  passNumber: number;
  parameters: Parameter[];
  shortTermResults: ParsedRebPassResult[];
  longTermResults: ParsedRebPassResult[];
}

export interface ParsedRebPassResult {
  result: number;
  trades: number;
  profitFactor: number;
  resultPerTrade: number;
  drawdownAmount: number;
  drawdownPercent: number;
}
