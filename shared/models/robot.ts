import { ParameterSet } from './parameter-set';
import { RobotStatus } from './robot-status';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';

export interface Robot {
  id: string;
  accountId: string;
  status: RobotStatus;
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  parameterSetId?: string;
  parameterSet?: ParameterSet;
  magicNumber?: string;
}
