export type BacktestThresholdType =
  | 'longTermResultPercent' // Le résultat (en %) du LT
  | 'shortTermPassResultPercent' // Le résultat (en %) des passages CT
  | 'longTermGainLossRatio' // Le ratio gain/chute des passages LT
  | 'shortTermTrades' // Le nombre de trades par passage CT
  | 'shortTermDrawdownPercent' // Le drawdown (en %) rencontré en CT
  | 'longTermDrawdownAmount'; // Le drawdown (en €) rencontré en LT

export interface BacktestThreshold {
  type: BacktestThresholdType;
  operator: '>' | '<';
  value: number;
  passRate: number; // % des passages qui doivent respecter le critère
}

export const BACKTEST_THRESHOLD_TYPE_WITH_DISABLED_PASS_RATE = [
  'longTermResultPercent',
  'longTermGainLossRatio',
  'longTermDrawdownAmount',
];
