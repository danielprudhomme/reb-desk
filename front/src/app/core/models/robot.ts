import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';
import { RobotStatus } from '@shared/models/robot-status';
import { Parameter } from '@shared/models/parameter';

export interface Robot extends RobotConfiguration {
  id: string;
  accountId: string;
  status: RobotStatus;
  parameters: Parameter[];
}

export interface RobotConfiguration {
  timeframe: Timeframe;
  expert: ExpertAdvisor;
  symbol: Symbol;
}

export type RobotInput = Omit<Robot, 'id'> & {
  id?: string;
};
