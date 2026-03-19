export interface BacktestPassResult {
  result: number;
  trades: number;
  profitFactor: number;
  resultPerTrade: number;
  drawdownAmount: number;
  drawdownPercent: number;
}
