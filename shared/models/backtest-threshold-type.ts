export type BacktestThresholdType =
  | 'longTermResultPercent' // Le résultat (en %) du LT
  | 'shortTermPassResultPercent' // Le résultat (en %) des passages CT
  | 'longTermGainLossRatio' // Le ratio gain/chute des passages LT
  | 'shortTermTrades' // Le nombre de trades par passage CT
  | 'shortTermDrawdownPercent' // Le drawdown (en %) rencontré en CT
  | 'longTermDrawdownAmount'; // Le drawdown (en €) rencontré en LT
