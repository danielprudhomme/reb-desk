import { GroupedBacktestPassAnalysis } from '@shared/models/backtest-pass-analysis';

export class BacktestLongTermSummary {
  averageResult: number;
  averageMonthlyPerformance: number;
  worstDrawdownAmount: number;
  worstDrawdownPercent: number;
  averageRewardRatio: number;

  constructor(pass: GroupedBacktestPassAnalysis) {
    if (pass.longTermUnit !== 'year') {
      throw new Error('Calculation not yet implemented. Only YEAR.');
    }

    const results = pass.longTermResults;
    const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

    this.averageResult = avg(results.map((r) => r.result));
    this.averageMonthlyPerformance = avg(
      results.map((r) => r.result / pass.capital / pass.longTermDuration / 12),
    );
    this.worstDrawdownAmount = Math.max(...results.map((r) => r.drawdownAmount));
    this.worstDrawdownPercent = Math.max(...results.map((r) => r.drawdownPercent));
    this.averageRewardRatio = avg(results.map((r) => r.result / r.drawdownAmount));
  }
}
