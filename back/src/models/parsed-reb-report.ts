import { OptimizationModel } from '@shared/models/optimization-model.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { ImportStatus } from '@shared/models/import-status.ts';
import { TimeUnit } from '@shared/models/time-unit.ts';
import { ParsedRebPass } from './parsed-reb-pass.ts';
import { Timeframe } from '@shared/models/timeframe.ts';

export interface ParsedRebReport {
  importStatus: ImportStatus;
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
  selectedPassNumber?: number;
  parsedPasses: ParsedRebPass[];
}
