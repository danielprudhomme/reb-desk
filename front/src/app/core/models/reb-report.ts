import { OptimizationModel } from '@shared/models/optimization-model';
import { TimeUnit } from '@shared/models/time-unit';
import { ImportStatus } from '@shared/models/import-status';
import { StrategyContext } from '@shared/models/strategy-context';

export interface RebReport {
  id: string;
  importStatus: ImportStatus;
  path: string;
  strategyContext: StrategyContext;
  model: OptimizationModel;
  startDate: string;
  lastValidatedDate?: string;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
}
