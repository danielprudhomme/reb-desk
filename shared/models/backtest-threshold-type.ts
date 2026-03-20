export type BacktestThresholdType =
  // ===== RESULT =====
  | 'shortTermResultPercent'
  | 'shortTermResultAmount'
  | 'shortTermResultPercentAvg'
  | 'shortTermResultAmountAvg'
  | 'shortTermResultPercentSum'
  | 'shortTermResultAmountSum'
  | 'longTermResultPercent'
  | 'longTermResultAmount'
  | 'longTermResultPercentLast'
  | 'longTermResultAmountLast'

  // ===== DRAWDOWN =====
  | 'shortTermDrawdownPercent'
  | 'shortTermDrawdownAmount'
  | 'longTermDrawdownPercent'
  | 'longTermDrawdownAmount'
  | 'longTermDrawdownPercentLast'
  | 'longTermDrawdownAmountLast'

  // ===== TRADES =====
  | 'shortTermTrades'
  | 'longTermTrades'

  // ===== RATIOS =====
  | 'shortTermGainLossRatio'
  | 'shortTermGainLossRatioGlobal'
  | 'longTermGainLossRatio'
  | 'longTermGainLossRatioLast'
  | 'shortTermEuroPerTrade'
  | 'longTermEuroPerTrade'
  | 'longTermEuroPerTradeLast'

  // ===== META =====
  | 'passCount'
  | 'passIndex';
