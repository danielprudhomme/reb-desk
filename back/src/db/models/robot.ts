import { RobotStatus } from '@shared/models/robot-status.ts';

export interface Robot {
  id: string;
  accountId: string;
  status: RobotStatus;
  strategyContextId: string;
  parameterSetId?: string;
}
