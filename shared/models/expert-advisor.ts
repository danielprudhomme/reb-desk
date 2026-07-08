export const expertAdvisors = [
  'candleSuite',
  'emaBb',
  'ichimoku',
  'rsiBreak',
  'scBbEngulfing',
  'scIchiSar',
  'scRsiBb',
  'scEmaRsi',
  'scEmaMacd',
  'scRsiEngulfing',
  'scEmaSar',
  'scRsiOnly',
  'scStochOnly',
  'autoBot',
] as const;

export type ExpertAdvisor = (typeof expertAdvisors)[number];
