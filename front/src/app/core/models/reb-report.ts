import { OptimizationModel } from '@shared/models/optimization-model';
import { TimeUnit } from '@shared/models/time-unit';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Symbol } from '@shared/models/symbol';
import { Timeframe } from '@shared/models/timeframe';
import { ImportStatus } from '@shared/models/import-status';
import { RebParameter } from './reb-parameter';

export interface RebReport {
  id: string;
  fingerprint: string;
  importStatus: ImportStatus;
  path: string;
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  leverage: number;
  capital: number;
  model: OptimizationModel;
  startDate: string;
  lastValidatedDate?: string;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
  parameters: RebParameter[];
}
