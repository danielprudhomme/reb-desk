import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';
import { BacktestPass } from '@shared/models/backtest-pass.ts';

type ThresholdComputation = (pass: BacktestPass, capital: number) => number[];

export const BACKTEST_THRESHOLD_PROPERTIES: Record<
  BacktestThresholdType,
  { usedValue: 'value' | 'rate'; compute: ThresholdComputation }
> = {
  // ===== RESULT =====
  shortTermResultPercent: {
    usedValue: 'rate',
    compute: (p, c) => p.shortTermResults.map((r) => (r.result / c) * 100),
  },

  shortTermResultAmount: {
    usedValue: 'rate',
    compute: (p) => p.shortTermResults.map((r) => r.result),
  },

  shortTermResultPercentAvg: {
    usedValue: 'rate',
    compute: (p, c) => [avg(p.shortTermResults.map((r) => (r.result / c) * 100))],
  },

  shortTermResultAmountAvg: {
    usedValue: 'rate',
    compute: (p) => [avg(p.shortTermResults.map((r) => r.result))],
  },

  shortTermResultPercentSum: {
    usedValue: 'rate',
    compute: (p, c) => [sum(p.shortTermResults.map((r) => (r.result / c) * 100))],
  },

  shortTermResultAmountSum: {
    usedValue: 'rate',
    compute: (p) => [sum(p.shortTermResults.map((r) => r.result))],
  },

  longTermResultPercent: {
    usedValue: 'value',
    compute: (p, c) => p.longTermResults.map((r) => (r.result / c) * 100),
  },

  longTermResultAmount: {
    usedValue: 'value',
    compute: (p) => p.longTermResults.map((r) => r.result),
  },

  longTermResultPercentLast: {
    usedValue: 'value',
    compute: (p, c) => [last(p.longTermResults.map((r) => (r.result / c) * 100))],
  },

  longTermResultAmountLast: {
    usedValue: 'value',
    compute: (p) => [last(p.longTermResults.map((r) => r.result))],
  },

  // ===== DRAWDOWN =====
  shortTermDrawdownPercent: {
    usedValue: 'rate',
    compute: (p) => p.shortTermResults.map((r) => r.drawdownPercent),
  },

  shortTermDrawdownAmount: {
    usedValue: 'rate',
    compute: (p) => p.shortTermResults.map((r) => r.drawdownAmount),
  },

  longTermDrawdownPercent: {
    usedValue: 'value',
    compute: (p) => p.longTermResults.map((r) => r.drawdownPercent),
  },

  longTermDrawdownAmount: {
    usedValue: 'value',
    compute: (p) => p.longTermResults.map((r) => r.drawdownAmount),
  },

  longTermDrawdownPercentLast: {
    usedValue: 'value',
    compute: (p) => [last(p.longTermResults.map((r) => r.drawdownPercent))],
  },

  longTermDrawdownAmountLast: {
    usedValue: 'value',
    compute: (p) => [last(p.longTermResults.map((r) => r.drawdownAmount))],
  },

  // ===== TRADES =====
  shortTermTrades: {
    usedValue: 'rate',
    compute: (p) => p.shortTermResults.map((r) => r.trades),
  },

  longTermTrades: {
    usedValue: 'value',
    compute: (p) => p.longTermResults.map((r) => r.trades),
  },

  // ===== RATIOS =====
  shortTermGainLossRatio: {
    usedValue: 'rate',
    compute: (p) => p.shortTermResults.map((r) => r.result / r.drawdownAmount),
  },

  shortTermGainLossRatioGlobal: {
    usedValue: 'rate',
    compute: (p) => [
      sum(p.shortTermResults.map((r) => r.result)) /
        sum(p.shortTermResults.map((r) => r.drawdownAmount)),
    ],
  },

  longTermGainLossRatio: {
    usedValue: 'value',
    compute: (p) => p.longTermResults.map((r) => r.result / r.drawdownAmount),
  },

  longTermGainLossRatioLast: {
    usedValue: 'value',
    compute: (p) => [last(p.longTermResults.map((r) => r.result / r.drawdownAmount))],
  },

  shortTermEuroPerTrade: {
    usedValue: 'rate',
    compute: (p) => p.shortTermResults.map((r) => r.result / r.trades),
  },

  longTermEuroPerTrade: {
    usedValue: 'value',
    compute: (p) => p.longTermResults.map((r) => r.result / r.trades),
  },

  longTermEuroPerTradeLast: {
    usedValue: 'value',
    compute: (p) => [last(p.longTermResults.map((r) => r.result / r.trades))],
  },

  // ===== META =====
  passCount: {
    usedValue: 'value',
    compute: (p) => [p.shortTermResults.length],
  },

  passIndex: {
    usedValue: 'value',
    compute: (p) => [p.id],
  },
};

const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
const last = (v: number[]) => v[v.length - 1] ?? 0;
