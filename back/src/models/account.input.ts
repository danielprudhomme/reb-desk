import { RobotInput } from './robot.input.ts';

export interface AccountInput {
  id?: string;
  name: string;
  capital: number;
  robots: RobotInput[];
}
