import { BacktestResult } from '@shared/models/backtest-result';
import { TimeUnit } from '@shared/models/time-unit';

export class BacktestLongTermSummary {
  averageResult: number;
  averageMonthlyPerformance: number;
  worstDrawdownAmount: number;
  worstDrawdownPercent: number;
  averageRewardRatio: number;

  constructor(
    longTermResults: BacktestResult[],
    capital: number,
    longTermUnit: TimeUnit,
    longTermDuration: number,
  ) {
    if (longTermUnit !== 'year') {
      throw new Error('Calculation not yet implemented. Only YEAR.');
    }

    const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

    this.averageResult = avg(longTermResults.map((r) => r.result));
    this.averageMonthlyPerformance = avg(
      longTermResults.map((r) => r.result / capital / longTermDuration / 12),
    );
    this.worstDrawdownAmount = Math.max(...longTermResults.map((r) => r.drawdownAmount));
    this.worstDrawdownPercent = Math.max(...longTermResults.map((r) => r.drawdownPercent));
    this.averageRewardRatio = avg(longTermResults.map((r) => r.result / r.drawdownAmount));
  }
}
