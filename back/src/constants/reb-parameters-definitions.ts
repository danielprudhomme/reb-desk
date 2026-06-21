import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';

export function getParameters(expert: ExpertAdvisor): string[] {
  return EXPERT_PARAMETER_DEFINITIONS[expert];
}

const COMMON_PARAMETERS: string[] = [
  'Inversion',
  'ATR_Period',
  'TP_Distance',
  'Distance_Between_Orders',
  'Distance_Between_Orders_Factor',

  'Grid_Recovery_Factor',
  'Grid_Recovery_Factor_Modifier',

  'Ini_Lot_Size_For_10k',
  'Use_Fixed_Lot_Size',

  'Max_Lot_Size_For_10k',
  'Min_Hours_Between_Trade',
  'Max_Amount_Of_First_Entries',
];

const EXPERT_PARAMETER_DEFINITIONS: Record<ExpertAdvisor, string[]> = {
  candleSuite: ['Suite', 'Extreme_Research', ...COMMON_PARAMETERS],

  rsiBreak: ['Extreme_Research', 'RSI_Period', 'RSI_Start', 'Delta_RSI_Buy', ...COMMON_PARAMETERS],

  emaBb: ['EMA_Slow_Period', 'BB_Period', 'BB_Deviation', 'BB_Way', ...COMMON_PARAMETERS],

  ichimoku: ['Tenkan_Sen', 'Kijun_Sen', 'Senkou_Span_B', 'Sup_Trend', ...COMMON_PARAMETERS],

  strategyCreator: [
    'MA_Slow_Period',
    'MA_Fast_Period',
    'MA_Method',
    'MA_TF',
    'MA_Score',
    'MA_Change_Score',
    'MA_Trend_Period',
    'MA_Trend_Method',
    'MA_Trend_TF',
    'MA_Trend_Score',
    'MA_Trend_Change_Score',

    'RSI_Period',
    'RSI_TF',
    'RSI_Min_Level',
    'RSI_Min_Score',
    'RSI_Min_Change_Score',
    'RSI_Max_Level',
    'RSI_Max_Score',
    'RSI_Max_Change_Score',

    'Tenkan_Sen',
    'Kijun_Sen',
    'Senkou_Span_B',
    'Ichi_TF',
    'Ichi_Cloud_Pos_Score',
    'Ichi_Cloud_Pos_Change_Score',
    'Ichi_Cloud_Way_Score',
    'Ichi_Cloud_Way_Change_Score',
    'Ichi_Tenkan_vs_Kijun_Score',
    'Ichi_Tenkan_vs_Kijun_Change_Score',
    'Ichi_Kijun_vs_Cloud_Score',
    'Ichi_Chiku_vs_All_Score',

    'Engulfing_Candle_Score',

    'BB_Period',
    'BB_Deviation',
    'BB_TF',
    'Under_Lower_BB_Score',
    'Above_Upper_BB_Score',

    'SAR_Step',
    'SAR_Max',
    'SAR_TF',
    'SAR_Score',

    'Stoch_K_Period',
    'Stoch_D_Period',
    'Stoch_Slowing',
    'Stoch_TF',
    'Stoch_Way_Score',

    'MACD_TF',
    'MACD_Fast',
    'MACD_Slow',
    'MACD_Signal',
    'MACD_Way_Score',

    'Aleatory_Score',

    'Min_Buy_Score',
    'Close_Score',

    ...COMMON_PARAMETERS,
  ],

  autoBot: [
    'Trade_Direction',
    'Entry_Agressivity',
    'Win_Level',
    'Win_Factor',
    'Recovery_Level',
    'Recovery_Factor',
    'Max_Lot_Size_Vs_Ini',
    'Min_Distance_Between_Entries',
    'Max_Amount_Of_First_Entries',
    'Ini_Lot_Size_For_1k',
    'Adapt_Lot_Size_To_Capital',
  ],
};
