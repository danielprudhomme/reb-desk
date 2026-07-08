import { ExpertAdvisor } from '@shared/models/expert-advisor';

export const EXPERT_CONSTANTS: Record<ExpertAdvisor, { name: string; ex5Name: string }> = {
  rsiBreak: { name: 'RSI Break', ex5Name: 'REB RSI-Break' },
  candleSuite: { name: 'Candle Suite', ex5Name: 'REB Candle-Suite' },
  emaBb: { name: 'EMA BB', ex5Name: 'REB EMA-BB' },
  ichimoku: { name: 'Ichimoku', ex5Name: 'REB Ichimoku-Bot' },
  scBbEngulfing: { name: 'SC BB Engulfing', ex5Name: 'REB Strategy Creator' },
  scIchiSar: { name: 'SC Ichimoku SAR', ex5Name: 'REB Strategy Creator' },
  scRsiBb: { name: 'SC RSI BB', ex5Name: 'REB Strategy Creator' },
  scEmaRsi: { name: 'SC EMA RSI', ex5Name: 'REB Strategy Creator' },
  scEmaMacd: { name: 'SC EMA MACD', ex5Name: 'REB Strategy Creator' },
  scRsiEngulfing: { name: 'SC RSI Engulfing', ex5Name: 'REB Strategy Creator' },
  scEmaSar: { name: 'SC EMA SAR', ex5Name: 'REB Strategy Creator' },
  scRsiOnly: { name: 'SC RSI Only', ex5Name: 'REB Strategy Creator' },
  scStochOnly: { name: 'SC Stoch Only', ex5Name: 'REB Strategy Creator' },
  autoBot: { name: 'AutoBot', ex5Name: 'REB AutoBot' },
};
