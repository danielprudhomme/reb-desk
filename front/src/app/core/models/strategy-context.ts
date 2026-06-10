import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Symbol } from '@shared/models/symbol';
import { Timeframe } from '@shared/models/timeframe';

export interface StrategyContext {
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  leverage: number;
  capital: number;
}
