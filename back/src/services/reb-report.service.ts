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
import expertConst from '@shared/constants/expert.constants.ts';

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
  generateProjectName(params: {
    expert: ExpertAdvisor;
    symbol: Symbol;
    timeframe: Timeframe;
    capital: number;
    startDate: string;
    shortTermCount: number;
    shortTermDuration: number;
    shortTermUnit: TimeUnit;
    longTermDuration: number;
    longTermUnit: TimeUnit;
  }): string {
    const expertName = expertConst.EXPERT_NAMES[params.expert].replaceAll(' ', '');
    const startDate = normalizeDate(params.startDate);
    const shortTerm = `${params.shortTermCount}x${params.shortTermDuration}${params.shortTermUnit.toString()[0]}`;
    const longTerm = `${params.longTermDuration}${params.longTermUnit.toString()[0]}`;
    const currentDate = normalizeDate();
    return `${params.symbol}-${params.timeframe}-${expertName}-${params.capital}-${startDate}-${shortTerm}-${longTerm}-${currentDate}`;
  },
};

function normalizeDate(date?: string): string {
  const input = date ?? new Date().toLocaleDateString('fr-FR'); // ex: 19/06/2026

  const digitsOnly = input.replace(/\D/g, ''); // 19062026

  const result =
    digitsOnly.substring(0, 2) + // jour
    digitsOnly.substring(2, 4) + // mois
    digitsOnly.substring(6, 8); // année (2 derniers chiffres)

  return result;
}

function normalizePass(passNumber: number, parameters: Parameter[]): string {
  return [passNumber, normalizeParameters(parameters)].join(':');
}
