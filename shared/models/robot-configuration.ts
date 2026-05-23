import { ExpertAdvisor } from './expert-advisor';
import { Symbol } from './symbol';
import { Timeframe } from './timeframe';

export interface RobotConfiguration {
  timeframe: Timeframe;
  expert: ExpertAdvisor;
  symbol: Symbol;
}
