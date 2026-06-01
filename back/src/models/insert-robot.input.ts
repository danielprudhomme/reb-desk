import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { Symbol } from '@shared/models/symbol.ts';

export interface InsertRobotInput {
  accountId: string;
  expert: ExpertAdvisor;
  timeframe: Timeframe;
  symbol: Symbol;
}
