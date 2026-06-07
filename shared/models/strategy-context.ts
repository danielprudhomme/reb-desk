import { ExpertAdvisor } from './expert-advisor';
import { Symbol } from './symbol';
import { Timeframe } from './timeframe';

export type StrategyContext = {
  id: string;
  symbol: Symbol;
  expert: ExpertAdvisor;
  timeframe: Timeframe;
  leverage: number;
  capital: number;
};
