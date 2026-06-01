import { RobotStatus } from '@shared/models/robot-status.ts';

export interface UpdateRobotInput {
  id: string;
  status: RobotStatus;
  parameterSetId: string;
}
