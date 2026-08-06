import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { ExpertParameterConfig } from '@src/models/expert-parameter-config.ts';

export const EXPERT_PARAMETERS: Record<ExpertAdvisor, ExpertParameterConfig[][]> = {
  candleSuite: [
    [
      { name: 'Suite', value: 4, variable: true, min: 1, max: 6, step: 4 },
      { name: 'Extreme_Research', value: 100, variable: true, min: 50, max: 500, step: 200 },
    ],
  ],

  emaBb: [
    [
      { name: 'EMA_Slow_Period', value: 200, variable: false, min: 50, max: 200, step: 0 },
      { name: 'BB_Period', value: 20, variable: true, min: 20, max: 100, step: 0 },
      { name: 'BB_Deviation', value: 2, variable: true, min: 1, max: 3, step: 1 },
      { name: 'BB_Way', value: 0, variable: true, min: 0, max: 1, step: 1 },
    ],
  ],

  rsiBreak: [
    [
      { name: 'Extreme_Research', value: 50, variable: true, min: 250, max: 500, step: 500 },
      { name: 'RSI_Period', value: 14, variable: false, min: 1, max: 140, step: 14 },
      { name: 'RSI_Start', value: 30, variable: true, min: 20, max: 50, step: 30 },
      { name: 'Delta_RSI_Buy', value: 20, variable: true, min: 20, max: 40, step: 20 },
    ],
  ],

  strategyCreator: [
    [
      { name: 'Engulfing_Candle_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'BB_Period', value: 200, variable: true, min: 50, max: 200, step: 50 },
      { name: 'BB_Deviation', value: 2, variable: true, min: 1, max: 3, step: 2 },
      { name: 'Under_Lower_BB_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Min_Buy_Score', value: 2, variable: false, min: 0.1, max: 10, step: 1 },
    ],

    [
      { name: 'Tenkan_Sen', value: 9, variable: false, min: 1, max: 90, step: 9 },
      { name: 'Kijun_Sen', value: 26, variable: false, min: 1, max: 260, step: 26 },
      { name: 'Senkou_Span_B', value: 52, variable: false, min: 1, max: 520, step: 52 },
      { name: 'Ichi_Cloud_Pos_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'SAR_Step', value: 0.02, variable: true, min: 0.01, max: 0.03, step: 0.01 },
      { name: 'SAR_Max', value: 0.2, variable: true, min: 0.1, max: 0.3, step: 0.1 },
      { name: 'SAR_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'SAR_Change_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Min_Buy_Score', value: 2, variable: false, min: 0.1, max: 10, step: 1 },
    ],

    [
      { name: 'RSI_Period', value: 42, variable: true, min: 28, max: 42, step: 14 },
      { name: 'RSI_Min_Level', value: 40, variable: true, min: 10, max: 60, step: 40 },
      { name: 'RSI_Min_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'BB_Period', value: 20, variable: true, min: 30, max: 50, step: 20 },
      { name: 'BB_Deviation', value: 1.5, variable: true, min: 1, max: 3, step: 2 },
      { name: 'Above_Lower_BB_Change_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Min_Buy_Score', value: 2, variable: false, min: 0.1, max: 10, step: 1 },
    ],

    [
      { name: 'MA_Slow_Period', value: 200, variable: false, min: 100, max: 200, step: 100 },
      { name: 'MA_Fast_Period', value: 50, variable: false, min: 30, max: 50, step: 20 },
      { name: 'MA_Method', value: 1, variable: false, min: 0, max: 3, step: 0 },
      { name: 'MA_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MA_Change_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MA_Trend_Period', value: 200, variable: true, min: 150, max: 200, step: 50 },
      { name: 'MA_Trend_Method', value: 1, variable: false, min: 0, max: 3, step: 0 },
      { name: 'MA_Trend_TF', value: 0, variable: false, min: 0, max: 49153, step: 0 },
      { name: 'MA_Trend_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'RSI_Period', value: 14, variable: true, min: 7, max: 14, step: 7 },
      { name: 'RSI_TF', value: 0, variable: false, min: 0, max: 49153, step: 0 },
      { name: 'RSI_Min_Level', value: 70, variable: false, min: 1, max: 300, step: 30 },
      { name: 'RSI_Min_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'RSI_Min_Change_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'RSI_Max_Level', value: 30, variable: true, min: 10, max: 60, step: 30 },
      { name: 'RSI_Max_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'RSI_Max_Change_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Min_Buy_Score', value: 2, variable: false, min: 0.1, max: 10, step: 1 },
    ],

    [
      { name: 'MA_Slow_Period', value: 200, variable: true, min: 100, max: 200, step: 100 },
      { name: 'MA_Fast_Period', value: 50, variable: true, min: 30, max: 50, step: 20 },
      { name: 'MA_Method', value: 1, variable: false, min: 0, max: 3, step: 0 },
      { name: 'MA_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MACD_Fast', value: 12, variable: false, min: 1, max: 120, step: 12 },
      { name: 'MACD_Slow', value: 26, variable: false, min: 1, max: 260, step: 26 },
      { name: 'MACD_Signal', value: 26, variable: false, min: 1, max: 260, step: 26 },
      { name: 'MACD_Way_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MACD_Way_Change_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MACD_Min_Level', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MACD_Min_Level_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MACD_Max_Level', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MACD_Max_Level_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Min_Buy_Score', value: 3, variable: false, min: 0.1, max: 10, step: 1 },
    ],

    [
      { name: 'RSI_Period', value: 14, variable: false, min: 14, max: 42, step: 14 },
      { name: 'RSI_Min_Level', value: 30, variable: false, min: 10, max: 60, step: 40 },
      { name: 'RSI_Min_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'RSI_Min_Change_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'RSI_Max_Level', value: 30, variable: true, min: 10, max: 50, step: 20 },
      { name: 'RSI_Max_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Engulfing_Candle_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Min_Buy_Score', value: 2, variable: false, min: 0.1, max: 10, step: 1 },
    ],

    [
      { name: 'MA_Slow_Period', value: 200, variable: false, min: 100, max: 200, step: 100 },
      { name: 'MA_Fast_Period', value: 50, variable: false, min: 30, max: 50, step: 20 },
      { name: 'MA_Method', value: 1, variable: false, min: 0, max: 3, step: 0 },
      { name: 'MA_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MA_Change_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'MA_Trend_Period', value: 50, variable: true, min: 50, max: 200, step: 50 },
      { name: 'MA_Trend_Method', value: 1, variable: false, min: 0, max: 3, step: 0 },
      { name: 'MA_Trend_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'SAR_Step', value: 0.02, variable: true, min: 0.01, max: 0.02, step: 0.01 },
      { name: 'SAR_Max', value: 0.1, variable: true, min: 0.1, max: 0.2, step: 0.1 },
      { name: 'SAR_Change_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Min_Buy_Score', value: 2, variable: false, min: 0.1, max: 10, step: 1 },
    ],

    [
      { name: 'RSI_Period', value: 28, variable: true, min: 14, max: 42, step: 14 },
      { name: 'RSI_Min_Level', value: 30, variable: false, min: 10, max: 60, step: 40 },
      { name: 'RSI_Min_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'RSI_Min_Change_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'RSI_Max_Level', value: 60, variable: true, min: 10, max: 90, step: 60 },
      { name: 'RSI_Max_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'RSI_Max_Change_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Min_Buy_Score', value: 1, variable: false, min: 0.1, max: 10, step: 1 },
    ],

    [
      { name: 'Stoch_K_Period', value: 25, variable: true, min: 10, max: 25, step: 5 },
      { name: 'Stoch_D_Period', value: 3, variable: true, min: 5, max: 12, step: 3 },
      { name: 'Stoch_Slowing', value: 3, variable: false, min: 1, max: 30, step: 3 },
      { name: 'Stoch_Average_Methode', value: 0, variable: false, min: 0, max: 3, step: 0 },
      { name: 'Stoch_TF', value: 0, variable: false, min: 0, max: 49153, step: 0 },
      { name: 'Stoch_Way_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Stoch_Way_Change_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Stoch_Min_Level', value: 20, variable: false, min: 1, max: 200, step: 20 },
      { name: 'Stoch_Min_Level_Score', value: 0, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Stoch_Max_Level', value: 20, variable: false, min: 1, max: 800, step: 80 },
      { name: 'Stoch_Max_Level_Score', value: 1, variable: false, min: 0, max: 0, step: 0 },
      { name: 'Min_Buy_Score', value: 2, variable: false, min: 0.1, max: 10, step: 1 },
    ],
  ],

  ichimoku: [],

  autoBot: [],
};
