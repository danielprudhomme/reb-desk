import { BacktestResult } from '@shared/models/backtest-result.ts';
import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';

type ThresholdComputation = ({
  shortTermResults,
  longTermResults,
  capital,
}: {
  shortTermResults: BacktestResult[];
  longTermResults: BacktestResult[];
  capital: number;
}) => number[];

export const BACKTEST_THRESHOLD_COMPUTE: Record<BacktestThresholdType, ThresholdComputation> = {
  // ===== RESULT =====
  shortTermResultPercent: (p) => p.shortTermResults.map((r) => (r.result / p.capital) * 100),

  shortTermResultAmount: (p) => p.shortTermResults.map((r) => r.result),

  shortTermResultPercentAvg: (p) => [
    avg(p.shortTermResults.map((r) => (r.result / p.capital) * 100)),
  ],

  shortTermResultAmountAvg: (p) => [avg(p.shortTermResults.map((r) => r.result))],

  shortTermResultPercentSum: (p) => [
    sum(p.shortTermResults.map((r) => (r.result / p.capital) * 100)),
  ],

  shortTermResultAmountSum: (p) => [sum(p.shortTermResults.map((r) => r.result))],

  longTermResultPercent: (p) => p.longTermResults.map((r) => (r.result / p.capital) * 100),

  longTermResultAmount: (p) => p.longTermResults.map((r) => r.result),

  longTermResultPercentLast: (p) => [
    last(p.longTermResults.map((r) => (r.result / p.capital) * 100)),
  ],

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

  passIndex: () => {
    throw new Error('not implemented');
  },
};

const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
const last = (v: number[]) => v[v.length - 1] ?? 0;
