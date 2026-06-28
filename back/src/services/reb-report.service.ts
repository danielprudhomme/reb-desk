import { Tx } from '@src/db/database.ts';
import { normalizeParameters } from './parameter.helper.ts';
import { createHash } from 'crypto';
import { RebReportDb, rebReportsTable } from '@src/db/schema/index.ts';
import { Parameter } from '@shared/models/parameter.ts';
import { ImportStatus } from '@shared/models/import-status.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { Symbol } from '@shared/models/symbol.ts';
import { OptimizationModel } from '@shared/models/optimization-model.ts';
import { TimeUnit } from '@shared/models/time-unit.ts';
import { Timeframe } from '@shared/models/timeframe.ts';

export const rebReportService = {
  insertTx(tx: Tx, report: RebReportDb): RebReportDb {
    return tx.insert(rebReportsTable).values(report).returning().get();
  },
  buildFingerprint(params: {
    passes: { passNumber: number; parameters: Parameter[] }[];
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
  }): string {
    const parameters = params.passes
      .map((p) => normalizePass(p.passNumber, p.parameters))
      .sort()
      .join('#');

    const normalized = [
      params.importStatus,
      params.expert,
      params.symbol,
      params.timeframe,
      params.leverage,
      params.capital,
      params.model,
      params.startDate,
      params.lastValidatedDate ?? '',
      params.shortTermCount,
      params.shortTermDuration,
      params.shortTermUnit,
      params.longTermDuration,
      params.longTermUnit,
      parameters,
    ].join('||');

    return createHash('sha1').update(normalized).digest('hex');
  },
};

function normalizePass(passNumber: number, parameters: Parameter[]): string {
  return [passNumber, normalizeParameters(parameters)].join(':');
}
