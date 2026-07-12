export const symbols = [
  'AUDCAD',
  'AUDCHF',
  'AUDJPY',
  'AUDNZD',
  'AUDUSD',
  'CADCHF',
  'CADJPY',
  'CHFJPY',
  'EURAUD',
  'EURCAD',
  'EURCHF',
  'EURGBP',
  'EURJPY',
  'EURNZD',
  'EURUSD',
  'GBPAUD',
  'GBPCAD',
  'GBPCHF',
  'GBPJPY',
  'GBPNZD',
  'GBPUSD',
  'NZDCAD',
  'NZDCHF',
  'NZDJPY',
  'NZDUSD',
  'USDCAD',
  'USDCHF',
  'USDJPY',
  'XAUUSD',
] as const;

export type Symbol = (typeof symbols)[number];

export function extractCurrencies(symbol: Symbol): [string, string] {
  return [symbol.slice(0, 3), symbol.slice(3, 6)];
}
