import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { Parameter } from '@shared/models/parameter.ts';

export interface Robot {
  id: string;
  accountId: string;
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  parameters: Parameter[];
  signature: string;
}
