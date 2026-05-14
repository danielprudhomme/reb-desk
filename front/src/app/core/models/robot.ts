import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';

export interface Robot {
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
}
