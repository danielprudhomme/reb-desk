import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';
import { RobotStatus } from '@shared/models/robot-status';

export interface Robot {
  status: RobotStatus | 'new';
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
}
