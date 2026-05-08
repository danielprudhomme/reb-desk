/* eslint-disable @typescript-eslint/no-unused-vars */
import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';
import { BaseBacktestPass } from '@shared/models/backtest-pass.ts';

type ThresholdComputation = (pass: BaseBacktestPass, capital: number) => number[];

export const BACKTEST_THRESHOLD_COMPUTE: Record<BacktestThresholdType, ThresholdComputation> = {
  // ===== RESULT =====
  shortTermResultPercent: (p, capital) => p.shortTermResults.map((r) => (r.result / capital) * 100),

  shortTermResultAmount: (p, capital) => p.shortTermResults.map((r) => r.result),

  shortTermResultPercentAvg: (p, capital) => [
    avg(p.shortTermResults.map((r) => (r.result / capital) * 100)),
  ],

  shortTermResultAmountAvg: (p, capital) => [avg(p.shortTermResults.map((r) => r.result))],

  shortTermResultPercentSum: (p, capital) => [
    sum(p.shortTermResults.map((r) => (r.result / capital) * 100)),
  ],

  shortTermResultAmountSum: (p, capital) => [sum(p.shortTermResults.map((r) => r.result))],

  longTermResultPercent: (p, capital) => p.longTermResults.map((r) => (r.result / capital) * 100),

  longTermResultAmount: (p, capital) => p.longTermResults.map((r) => r.result),

  longTermResultPercentLast: (p, capital) => [
    last(p.longTermResults.map((r) => (r.result / capital) * 100)),
  ],

  longTermResultAmountLast: (p, capital) => [last(p.longTermResults.map((r) => r.result))],

  // ===== DRAWDOWN =====
  shortTermDrawdownPercent: (p, capital) => p.shortTermResults.map((r) => r.drawdownPercent),

  shortTermDrawdownAmount: (p, capital) => p.shortTermResults.map((r) => r.drawdownAmount),

  longTermDrawdownPercent: (p, capital) => p.longTermResults.map((r) => r.drawdownPercent),

  longTermDrawdownAmount: (p, capital) => p.longTermResults.map((r) => r.drawdownAmount),

  longTermDrawdownPercentLast: (p, capital) => [
    last(p.longTermResults.map((r) => r.drawdownPercent)),
  ],

  longTermDrawdownAmountLast: (p, capital) => [
    last(p.longTermResults.map((r) => r.drawdownAmount)),
  ],

  // ===== TRADES =====
  shortTermTrades: (p, capital) => p.shortTermResults.map((r) => r.trades),

  longTermTrades: (p, capital) => p.longTermResults.map((r) => r.trades),

  // ===== RATIOS =====
  shortTermGainLossRatio: (p, capital) =>
    p.shortTermResults.map((r) => r.result / r.drawdownAmount),

  shortTermGainLossRatioGlobal: (p, capital) => [
    sum(p.shortTermResults.map((r) => r.result)) /
      sum(p.shortTermResults.map((r) => r.drawdownAmount)),
  ],

  longTermGainLossRatio: (p, capital) => p.longTermResults.map((r) => r.result / r.drawdownAmount),

  longTermGainLossRatioLast: (p, capital) => [
    last(p.longTermResults.map((r) => r.result / r.drawdownAmount)),
  ],

  shortTermEuroPerTrade: (p, capital) => p.shortTermResults.map((r) => r.result / r.trades),

  longTermEuroPerTrade: (p, capital) => p.longTermResults.map((r) => r.result / r.trades),

  longTermEuroPerTradeLast: (p, capital) => [
    last(p.longTermResults.map((r) => r.result / r.trades)),
  ],

  // ===== META =====
  passCount: (p, capital) => [p.shortTermResults.length],

  passIndex: () => {
    throw new Error('not implemented');
  },
};

const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
const last = (v: number[]) => v[v.length - 1] ?? 0;
