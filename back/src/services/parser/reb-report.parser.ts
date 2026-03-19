import { readFile } from 'node:fs/promises';
import type { Currency } from '@shared/models/currency.ts';
import type { OptimizationModel } from '@shared/models/optimization-model.ts';
import rebParamsDefinitions from '@shared/constants/reb-parameters-definitions.ts';
import type { TimeUnit } from '@shared/models/time-unit.ts';
import { ImportStatus } from '@shared/models/import-status.ts';
import { ParsedRebReport } from 'src/models/parsed-reb-report.ts';
import { ParsedRebParameter } from 'src/models/parsed-reb-parameter.ts';
import { parseParameters } from './reb-parameter.parser.ts';
import { extractExpert, extractValue, requiredValue } from './parser-helper.ts';

function parseTimeUnit(value: string): TimeUnit {
  const v = value.toLowerCase();
  if (v.includes('an') || v.includes('year')) return 'year';
  if (v.includes('mois') || v.includes('month')) return 'month';
  if (v.includes('semaine') || v.includes('week')) return 'week';
  if (v.includes('jour') || v.includes('day')) return 'day';
  throw new Error(`Unknown time unit: ${value}`);
}

function parseCurrency(value: string): Currency {
  if (value.trim().toUpperCase() === 'EUR') return 'EUR';
  throw new Error(`Unknown currency: ${value}`);
}

function parseModel(value: string): OptimizationModel {
  if (value.toLowerCase().includes('ouverture') || value.toLowerCase().includes('opening')) {
    return 'openingPriceOnly';
  }
  throw new Error(`Unknown model: ${value}`);
}

function parseDate(value: string): string {
  // DD/MM/YYYY → YYYY-MM-DD
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

function computeImportStatus(params: {
  content: string;
  startDate: string;
  lastValidatedDate?: string;
  longTermDuration: number;
  longTermUnit: TimeUnit;
}): ImportStatus {
  const { content, startDate, lastValidatedDate, longTermDuration, longTermUnit } = params;

  if (!content.includes('==SENS DES PASSAGES==')) {
    return 'new';
  }

  if (!lastValidatedDate) {
    return 'ongoing';
  }

  const start = new Date(startDate);

  const targetDate = addDuration(start, longTermDuration, longTermUnit);

  const target = targetDate.toISOString().split('T')[0];

  if (lastValidatedDate === target) {
    return 'completed';
  }

  return 'ongoing';
}

function addDuration(date: Date, duration: number, unit: TimeUnit): Date {
  const d = new Date(date);

  switch (unit) {
    case 'year':
      d.setFullYear(d.getFullYear() + duration);
      break;

    case 'month':
      d.setMonth(d.getMonth() + duration);
      break;

    case 'week':
      d.setDate(d.getDate() + duration * 7);
      break;

    case 'day':
      d.setDate(d.getDate() + duration);
      break;
  }

  return d;
}

export async function parseRebFile(
  filePath: string,
): Promise<{ report: ParsedRebReport; parameters: ParsedRebParameter[] }> {
  const content = await readFile(filePath, { encoding: 'utf-8' });
  const lines = content.split(/\r?\n/);

  const startDate = parseDate(requiredValue(lines, 'DATE DE DEBUT TESTS :'));
  const lastValidatedRaw = extractValue(lines, 'DERNIERE DATE VALIDE :');
  const lastValidatedDate = lastValidatedRaw ? parseDate(lastValidatedRaw) : undefined;
  const longTermDuration = parseInt(requiredValue(lines, 'DUREE LONG TERME :'));
  const longTermUnit = parseTimeUnit(requiredValue(lines, 'UNITE LONG TERME :'));
  const importStatus = computeImportStatus({
    content,
    startDate,
    lastValidatedDate,
    longTermDuration,
    longTermUnit,
  });
  const expert = extractExpert(lines);
  const allowedParameters = rebParamsDefinitions.EXPERT_PARAMETERS[expert] ?? [];
  const parameters = parseParameters(content, allowedParameters);

  return {
    report: {
      path: filePath,
      importStatus,
      expert,
      symbol: requiredValue(lines, 'SYMBOLE :'),
      timeframe: requiredValue(lines, 'UNITE DE TEMPS :'),
      leverage: parseInt(requiredValue(lines, 'SPREAD :')),
      capital: parseFloat(requiredValue(lines, 'CAPITAL :')),
      currency: parseCurrency(requiredValue(lines, 'DEVISE :')),
      model: parseModel(requiredValue(lines, "MODELE D'OPTIMISATION :")),
      startDate,
      lastValidatedDate,
      shortTermCount: parseInt(requiredValue(lines, 'NOMBRE DE COURT TERME :')),
      shortTermDuration: parseInt(requiredValue(lines, 'DUREE COURT TERME :')),
      shortTermUnit: parseTimeUnit(requiredValue(lines, 'UNITE COURT TERME :')),
      longTermDuration,
      longTermUnit,
    },
    parameters,
  };
}
