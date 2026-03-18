export const COMMON_PARAMETERS = [
  'Inversion',
  'ATR_Period',
  'TP_Distance',
  'Distance_Between_Orders',
  'Distance_Between_Orders_Factor',
  'Ini_Lot_Size_For_10k',
  'Grid_Recovery_Factor',
  'Grid_Recovery_Factor_Modifier',
  'Max_Lot_Size_For_10k',
  'Min_Hours_Between_Trade',
];

export const RSI_BREAK_PARAMETERS = [
  'Extreme_Research',
  'RSI_Period',
  'RSI_Start',
  'Delta_RSI_Buy',
];

export const EXPERT_PARAMETERS: Record<string, string[]> = {
  rsiBreak: [...RSI_BREAK_PARAMETERS, ...COMMON_PARAMETERS],
  candleSuite: [...COMMON_PARAMETERS],
  emaBb: [...COMMON_PARAMETERS],
  ichimoku: [...COMMON_PARAMETERS],
  strategyCreator: [...COMMON_PARAMETERS],
  autoBot: [],
};
