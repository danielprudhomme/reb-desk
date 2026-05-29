import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';

export interface StrategyContext {
  id: string;
  expert: ExpertAdvisor;
  symbol: string;
  timeframe: string;
  leverage: number;
  capital: number;
}
