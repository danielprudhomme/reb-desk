import { OptimizationModel } from '../../../../shared/models/optimization-model.ts';
import { TimeUnit } from '../../../../shared/models/time-unit.ts';
import { ExpertAdvisor } from '../../../../shared/models/expert-advisor.ts';
import { ImportStatus } from '../../../../shared/models/import-status.ts';

export interface RebReport {
  id: string;
  fingerprint: string;
  importStatus: ImportStatus;
  path: string;
  expert: ExpertAdvisor;
  symbol: string;
  timeframe: string;
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
