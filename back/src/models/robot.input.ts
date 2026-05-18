import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { RobotStatus } from '@shared/models/robot-status.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { Parameter } from '@shared/models/parameter.ts';

export interface RobotInput {
  id?: string;
  accountId: string;
  expert: ExpertAdvisor;
  timeframe: Timeframe;
  symbol: Symbol;
  status: RobotStatus;
  parameters: Parameter[];
}
