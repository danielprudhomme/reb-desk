export interface BacktestResult {
  position: number;
  result: number;
  trades: number;
  profitFactor: number;
  resultPerTrade: number;
  drawdownAmount: number;
  drawdownPercent: number;
}
