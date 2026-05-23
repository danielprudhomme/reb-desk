import { RobotConfiguration } from '@shared/models/robot-configuration';
import { RobotStatus } from '@shared/models/robot-status';
import { Parameter } from '@shared/models/parameter';

export interface Robot extends RobotConfiguration {
  id: string;
  accountId: string;
  status: RobotStatus;
  parameters: Parameter[];
}

export type RobotInput = Omit<Robot, 'id'> & {
  id?: string;
};
