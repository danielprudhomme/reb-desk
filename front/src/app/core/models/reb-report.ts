import { Currency } from '@shared/models/currency.js';
import { OptimizationModel } from '@shared/models/optimization-model.js';
import { TimeUnit } from '@shared/models/time-unit.js';
import { ExpertAdvisor } from '@shared/models/expert-advisor.js';
import { ImportStatus } from '@shared/models/import-status.js';
import { RebParameter } from './reb-parameter';

export interface RebReport {
  id: string;
  mtime: number;
  fingerprint: string;
  importStatus: ImportStatus;
  path: string;
  expert: ExpertAdvisor;
  symbol: string;
  timeframe: string;
  leverage: number;
  capital: number;
  currency: Currency;
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
