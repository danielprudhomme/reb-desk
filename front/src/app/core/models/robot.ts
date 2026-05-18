import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';
import { RobotStatus } from '@shared/models/robot-status';
import { Parameter } from '@shared/models/parameter';

export interface Robot {
  id: string;
  accountId: string;
  status: RobotStatus;
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  parameters: Parameter[];
}

export type RobotInput = Omit<Robot, 'id'> & {
  id?: string;
};
