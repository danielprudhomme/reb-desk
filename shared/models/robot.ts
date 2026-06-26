import { StrategyContext } from './strategy-context';
import { ParameterSet } from './parameter-set';
import { RobotStatus } from './robot-status';

export interface Robot {
  id: string;
  accountId: string;
  status: RobotStatus;
  strategyContext: StrategyContext;
  parameterSetId?: string;
  parameterSet?: ParameterSet;
  magicNumber?: string;
}
