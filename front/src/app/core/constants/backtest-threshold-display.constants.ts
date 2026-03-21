import { BacktestThresholdType } from '@shared/models/backtest-threshold-type';
import { ThresholdDisplayConfig } from '../models/threshold-display-config';

export const BACKTEST_THRESHOLD_DISPLAY: Record<BacktestThresholdType, ThresholdDisplayConfig> = {
  // ===== RESULT =====
  shortTermResultPercent: {
    label: 'CT Result (%)',
    pipe: 'percent',
  },
  shortTermResultAmount: {
    label: 'CT Result (€)',
    pipe: 'amount',
  },
  shortTermResultPercentAvg: {
    label: 'CT Avg Result (%)',
    pipe: 'percent',
  },
  shortTermResultAmountAvg: {
    label: 'CT Avg Result (€)',
    pipe: 'amount',
  },
  shortTermResultPercentSum: {
    label: 'CT Sum Result (%)',
    pipe: 'percent',
  },
  shortTermResultAmountSum: {
    label: 'CT Sum Result (€)',
    pipe: 'amount',
  },
  longTermResultPercent: {
    label: 'LT Result (%)',
    pipe: 'percent',
  },
  longTermResultAmount: {
    label: 'LT Result (€)',
    pipe: 'amount',
  },
  longTermResultPercentLast: {
    label: 'Last LT Result (%)',
    pipe: 'percent',
  },
  longTermResultAmountLast: {
    label: 'Last LT Result (€)',
    pipe: 'amount',
  },

  // ===== DRAWDOWN =====
  shortTermDrawdownPercent: {
    label: 'CT Drawdown (%)',
    pipe: 'percent',
  },
  shortTermDrawdownAmount: {
    label: 'CT Drawdown (€)',
    pipe: 'amount',
  },
  longTermDrawdownPercent: {
    label: 'LT Drawdown (%)',
    pipe: 'percent',
  },
  longTermDrawdownAmount: {
    label: 'LT Drawdown (€)',
    pipe: 'amount',
  },
  longTermDrawdownPercentLast: {
    label: 'Last LT Drawdown (%)',
    pipe: 'percent',
  },
  longTermDrawdownAmountLast: {
    label: 'Last LT Drawdown (€)',
    pipe: 'amount',
  },

  // ===== TRADES =====
  shortTermTrades: {
    label: 'CT Trades',
    pipe: 'number',
  },
  longTermTrades: {
    label: 'LT Trades',
    pipe: 'number',
  },

  // ===== RATIOS =====
  shortTermGainLossRatio: {
    label: 'CT Gain/Loss',
    pipe: 'ratio',
  },
  shortTermGainLossRatioGlobal: {
    label: 'CT Gain/Loss (Global)',
    pipe: 'ratio',
  },
  longTermGainLossRatio: {
    label: 'LT Gain/Loss',
    pipe: 'ratio',
  },
  longTermGainLossRatioLast: {
    label: 'Last LT Gain/Loss',
    pipe: 'ratio',
  },
  shortTermEuroPerTrade: {
    label: 'CT €/Trade',
    pipe: 'amount',
  },
  longTermEuroPerTrade: {
    label: 'LT €/Trade',
    pipe: 'amount',
  },
  longTermEuroPerTradeLast: {
    label: 'Last LT €/Trade',
    pipe: 'amount',
  },

  // ===== META =====
  passCount: {
    label: 'Pass Count',
    pipe: 'number',
  },
  passIndex: {
    label: 'Pass Index',
    pipe: 'number',
  },
};
