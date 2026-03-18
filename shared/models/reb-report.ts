import { Currency } from './currency';
import { OptimizationModel } from './optimization-model';
import { TimeUnit } from './time-unit';
import { ExpertAdvisor } from './expert-advisor';
import { ImportStatus } from './import-status';
import { RebParameter } from './reb-parameter';

export interface RebReport {
  id: string;
  mtime: number;
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
