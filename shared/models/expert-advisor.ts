export const expertAdvisors = [
  'candleSuite',
  'emaBb',
  'ichimoku',
  'rsiBreak',
  'strategyCreator',
  'autoBot',
] as const;

export type ExpertAdvisor = (typeof expertAdvisors)[number];
