import { ExpertAdvisor } from './expert-advisor';
import { Symbol } from './symbol';
import { Timeframe } from './timeframe';

export interface Robot {
  expert: ExpertAdvisor;
  timeframe: Timeframe;
  symbol: Symbol;
}
