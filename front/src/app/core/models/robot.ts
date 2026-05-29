import { RobotStatus } from '@shared/models/robot-status';
import { StrategyContext } from './strategy-context';
import { ParameterSet } from './parameter-set';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';

export interface Robot {
  id: string;
  accountId: string;
  status: RobotStatus;
  strategyContext: StrategyContext;
  parameterSet?: ParameterSet;
}

export interface RobotInput {
  id?: string;
  accountId: string;
  expert: ExpertAdvisor;
  timeframe: Timeframe;
  symbol: Symbol;
  status: RobotStatus;
  parameterSetId?: string;
}
