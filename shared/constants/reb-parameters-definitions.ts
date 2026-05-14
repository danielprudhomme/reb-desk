export type ParameterDefinition = {
  name: string;
  important: boolean;
};

export function getImportantParameters(expert: string): string[] {
  return EXPERT_PARAMETER_DEFINITIONS[expert]?.filter((p) => p.important).map((p) => p.name) ?? [];
}

export function getParameters(expert: string): string[] {
  return EXPERT_PARAMETER_DEFINITIONS[expert]?.map((p) => p.name) ?? [];
}

export const COMMON_PARAMETERS: ParameterDefinition[] = [
  { name: 'Inversion', important: true },
  { name: 'ATR_Period', important: false },
  { name: 'TP_Distance', important: true },

  { name: 'Distance_Between_Orders', important: true },
  { name: 'Distance_Between_Orders_Factor', important: false },

  { name: 'Ini_Lot_Size_For_10k', important: true },
  { name: 'Grid_Recovery_Factor', important: false },
  { name: 'Grid_Recovery_Factor_Modifier', important: false },

  { name: 'Max_Lot_Size_For_10k', important: false },
  { name: 'Min_Hours_Between_Trade', important: false },
];

export const EXPERT_PARAMETER_DEFINITIONS: Record<string, ParameterDefinition[]> = {
  candleSuite: [
    { name: 'Suite', important: true },
    { name: 'Extreme_Research', important: true },
    ...COMMON_PARAMETERS,
  ],

  rsiBreak: [
    { name: 'Extreme_Research', important: true },
    { name: 'RSI_Period', important: true },
    { name: 'RSI_Start', important: true },
    { name: 'Delta_RSI_Buy', important: true },
    ...COMMON_PARAMETERS,
  ],

  emaBb: [
    { name: 'EMA_Slow_Period', important: true },
    { name: 'BB_Period', important: true },
    { name: 'BB_Deviation', important: true },
    { name: 'BB_Way', important: true },
    ...COMMON_PARAMETERS,
  ],

  ichimoku: [
    { name: 'Tenkan_Sen', important: true },
    { name: 'Kijun_Sen', important: true },
    { name: 'Senkou_Span_B', important: true },
    { name: 'Sup_Trend', important: true },
    ...COMMON_PARAMETERS,
  ],

  strategyCreator: [
    { name: 'MA_Slow_Period', important: true },
    { name: 'MA_Fast_Period', important: true },
    { name: 'MA_Method', important: true },
    { name: 'MA_TF', important: true },
    { name: 'MA_Score', important: true },
    { name: 'MA_Change_Score', important: true },
    { name: 'MA_Trend_Period', important: true },
    { name: 'MA_Trend_Method', important: true },
    { name: 'MA_Trend_TF', important: true },
    { name: 'MA_Trend_Score', important: true },
    { name: 'MA_Trend_Change_Score', important: true },

    { name: 'RSI_Period', important: true },
    { name: 'RSI_TF', important: true },
    { name: 'RSI_Min_Level', important: true },
    { name: 'RSI_Min_Score', important: true },
    { name: 'RSI_Min_Change_Score', important: true },
    { name: 'RSI_Max_Level', important: true },
    { name: 'RSI_Max_Score', important: true },
    { name: 'RSI_Max_Change_Score', important: true },

    { name: 'Tenkan_Sen', important: true },
    { name: 'Kijun_Sen', important: true },
    { name: 'Senkou_Span_B', important: true },
    { name: 'Ichi_TF', important: true },
    { name: 'Ichi_Cloud_Pos_Score', important: true },
    { name: 'Ichi_Cloud_Pos_Change_Score', important: true },
    { name: 'Ichi_Cloud_Way_Score', important: true },
    { name: 'Ichi_Cloud_Way_Change_Score', important: true },
    { name: 'Ichi_Tenkan_vs_Kijun_Score', important: true },
    { name: 'Ichi_Tenkan_vs_Kijun_Change_Score', important: true },
    { name: 'Ichi_Kijun_vs_Cloud_Score', important: true },
    { name: 'Ichi_Chiku_vs_All_Score', important: true },

    { name: 'Engulfing_Candle_Score', important: true },

    { name: 'BB_Period', important: true },
    { name: 'BB_Deviation', important: true },
    { name: 'BB_TF', important: true },
    { name: 'Under_Lower_BB_Score', important: true },
    { name: 'Above_Upper_BB_Score', important: true },

    { name: 'SAR_Step', important: true },
    { name: 'SAR_Max', important: true },
    { name: 'SAR_TF', important: true },
    { name: 'SAR_Score', important: true },

    { name: 'Stoch_K_Period', important: true },
    { name: 'Stoch_D_Period', important: true },
    { name: 'Stoch_Slowing', important: true },
    { name: 'Stoch_TF', important: true },
    { name: 'Stoch_Way_Score', important: true },

    { name: 'MACD_TF', important: true },
    { name: 'MACD_Fast', important: true },
    { name: 'MACD_Slow', important: true },
    { name: 'MACD_Signal', important: true },
    { name: 'MACD_Way_Score', important: true },

    { name: 'Aleatory_Score', important: true },

    { name: 'Min_Buy_Score', important: true },
    { name: 'Close_Score', important: true },

    ...COMMON_PARAMETERS,
  ],

  autoBot: [
    { name: 'Ini_Lot_Size_For_1k', important: true },
    { name: 'Adapt_Lot_Size_To_Capital', important: true },
    { name: 'Trade_Direction', important: true },
    { name: 'Entry_Agressivity', important: true },
    { name: 'Win_Level', important: true },
    { name: 'Win_Factor', important: true },
    { name: 'Recovery_Level', important: true },
    { name: 'Recovery_Factor', important: true },
    { name: 'Max_Lot_Size_Vs_Ini', important: true },
    { name: 'Min_Distance_Between_Entries', important: true },
    { name: 'Max_Amount_Of_First_Entries', important: true },
  ],
};
