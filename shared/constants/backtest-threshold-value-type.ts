import { BacktestThresholdType } from '../models/backtest-threshold-type';

export const BACKTEST_THRESHOLD_VALUE_TYPE: Record<BacktestThresholdType, 'value' | 'rate'> = {
  // ===== RESULT =====
  shortTermResultPercent: 'rate',
  shortTermResultAmount: 'rate',
  shortTermResultPercentAvg: 'rate',
  shortTermResultAmountAvg: 'rate',
  shortTermResultPercentSum: 'rate',
  shortTermResultAmountSum: 'rate',

  longTermResultPercent: 'value',
  longTermResultAmount: 'value',
  longTermResultPercentLast: 'value',
  longTermResultAmountLast: 'value',

  // ===== DRAWDOWN =====
  shortTermDrawdownPercent: 'rate',
  shortTermDrawdownAmount: 'rate',

  longTermDrawdownPercent: 'value',
  longTermDrawdownAmount: 'value',
  longTermDrawdownPercentLast: 'value',
  longTermDrawdownAmountLast: 'value',

  // ===== TRADES =====
  shortTermTrades: 'rate',
  longTermTrades: 'value',

  // ===== RATIOS =====
  shortTermGainLossRatio: 'rate',
  shortTermGainLossRatioGlobal: 'rate',

  longTermGainLossRatio: 'value',
  longTermGainLossRatioLast: 'value',

  shortTermEuroPerTrade: 'rate',
  longTermEuroPerTrade: 'value',
  longTermEuroPerTradeLast: 'value',

  // ===== META =====
  passCount: 'value',
  passIndex: 'value',
};
