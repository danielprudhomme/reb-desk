import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { Timeframe } from '@shared/models/timeframe.ts';

export interface StrategyContext {
  id: string;
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  leverage: number;
  capital: number;
}
