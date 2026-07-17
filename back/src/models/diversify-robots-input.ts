import { ExpertDistribution } from '@shared/models/expert-distribution.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { Symbol } from '@shared/models/symbol.ts';

export interface DiversifyRobotsInput {
  accountId: string;
  timeframes: Timeframe[];
  symbols: Symbol[];
  distribution: ExpertDistribution;
}
