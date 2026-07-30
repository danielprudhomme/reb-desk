import { ExpertAdvisor } from '@shared/models/expert-advisor';

export const EXPERT_CONSTANTS: Record<ExpertAdvisor, { name: string; ex5Name: string }> = {
  rsiBreak: { name: 'RSI Break', ex5Name: 'REB RSI-Break' },
  candleSuite: { name: 'Candle Suite', ex5Name: 'REB Candle-Suite' },
  emaBb: { name: 'EMA BB', ex5Name: 'REB EMA-BB' },
  ichimoku: { name: 'Ichimoku', ex5Name: 'REB Ichimoku-Bot' },
  strategyCreator: { name: 'Strategy Creator', ex5Name: 'REB Strategy Creator' },
  autoBot: { name: 'AutoBot', ex5Name: 'REB AutoBot' },
};
