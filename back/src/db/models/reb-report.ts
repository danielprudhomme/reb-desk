import { OptimizationModel } from '../../../../shared/models/optimization-model.ts';
import { TimeUnit } from '../../../../shared/models/time-unit.ts';
import { ImportStatus } from '../../../../shared/models/import-status.ts';
import { createHash } from 'crypto';
import { ParsedRebReport } from '@src/models/parsed-reb-report.ts';
import { ParsedRebPass } from '@src/models/parsed-reb-pass.ts';
import { normalizeParameters } from '@src/services/parameter.helper.ts';

export interface RebReport {
  id: string;
  strategyContextId: string;
  fingerprint: string;
  importStatus: ImportStatus;
  path: string;
  model: OptimizationModel;
  startDate: string;
  lastValidatedDate?: string;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
}

function normalizePass(pass: ParsedRebPass): string {
  return [pass.passNumber, normalizeParameters(pass.parameters)].join(':');
}

export function buildRebReportFingerprintHash(parsed: ParsedRebReport): string {
  const parameters = parsed.parsedPasses.map(normalizePass).sort().join('#');

  const normalized = [
    parsed.importStatus,
    parsed.expert,
    parsed.symbol,
    parsed.timeframe,
    parsed.leverage,
    parsed.capital,
    parsed.model,
    parsed.startDate,
    parsed.lastValidatedDate ?? '',
    parsed.shortTermCount,
    parsed.shortTermDuration,
    parsed.shortTermUnit,
    parsed.longTermDuration,
    parsed.longTermUnit,
    parameters,
  ].join('||');

  return createHash('sha1').update(normalized).digest('hex');
}
