import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';
import { BacktestPass } from 'src/models/backtest-pass.ts';

type ThresholdComputation = (pass: BacktestPass, capital: number) => number[];

export const BACKTEST_THRESHOLD_PROPERTIES: Record<BacktestThresholdType, ThresholdComputation> = {
  // ===== RESULT =====
  shortTermResultPercent: (p, c) => p.shortTermResults.map((r) => (r.result / c) * 100),

  shortTermResultAmount: (p) => p.shortTermResults.map((r) => r.result),

  shortTermResultPercentAvg: (p, c) => [avg(p.shortTermResults.map((r) => (r.result / c) * 100))],

  shortTermResultAmountAvg: (p) => [avg(p.shortTermResults.map((r) => r.result))],

  shortTermResultPercentSum: (p, c) => [sum(p.shortTermResults.map((r) => (r.result / c) * 100))],

  shortTermResultAmountSum: (p) => [sum(p.shortTermResults.map((r) => r.result))],

  longTermResultPercent: (p, c) => p.longTermResults.map((r) => (r.result / c) * 100),

  longTermResultAmount: (p) => p.longTermResults.map((r) => r.result),

  longTermResultPercentLast: (p, c) => [last(p.longTermResults.map((r) => (r.result / c) * 100))],

  longTermResultAmountLast: (p) => [last(p.longTermResults.map((r) => r.result))],

  // ===== DRAWDOWN =====
  shortTermDrawdownPercent: (p) => p.shortTermResults.map((r) => r.drawdownPercent),

  shortTermDrawdownAmount: (p) => p.shortTermResults.map((r) => r.drawdownAmount),

  longTermDrawdownPercent: (p) => p.longTermResults.map((r) => r.drawdownPercent),

  longTermDrawdownAmount: (p) => p.longTermResults.map((r) => r.drawdownAmount),

  longTermDrawdownPercentLast: (p) => [last(p.longTermResults.map((r) => r.drawdownPercent))],

  longTermDrawdownAmountLast: (p) => [last(p.longTermResults.map((r) => r.drawdownAmount))],

  // ===== TRADES =====
  shortTermTrades: (p) => p.shortTermResults.map((r) => r.trades),

  longTermTrades: (p) => p.longTermResults.map((r) => r.trades),

  // ===== RATIOS =====
  shortTermGainLossRatio: (p) => p.shortTermResults.map((r) => r.result / r.drawdownAmount),

  shortTermGainLossRatioGlobal: (p) => [
    sum(p.shortTermResults.map((r) => r.result)) /
      sum(p.shortTermResults.map((r) => r.drawdownAmount)),
  ],

  longTermGainLossRatio: (p) => p.longTermResults.map((r) => r.result / r.drawdownAmount),

  longTermGainLossRatioLast: (p) => [
    last(p.longTermResults.map((r) => r.result / r.drawdownAmount)),
  ],

  shortTermEuroPerTrade: (p) => p.shortTermResults.map((r) => r.result / r.trades),

  longTermEuroPerTrade: (p) => p.longTermResults.map((r) => r.result / r.trades),

  longTermEuroPerTradeLast: (p) => [last(p.longTermResults.map((r) => r.result / r.trades))],

  // ===== META =====
  passCount: (p) => [p.shortTermResults.length],

  passIndex: (p) => [p.id],
};

const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
const last = (v: number[]) => v[v.length - 1] ?? 0;
