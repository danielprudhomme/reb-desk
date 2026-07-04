import { OptimizationModel } from '@shared/models/optimization-model';
import { TimeUnit } from '@shared/models/time-unit';
import { ImportStatus } from '@shared/models/import-status';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';

export interface RebReport {
  id: string;
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
}
