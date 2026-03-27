import { readFile } from 'node:fs/promises';
import type { Currency } from '@shared/models/currency.ts';
import type { OptimizationModel } from '@shared/models/optimization-model.ts';
import rebParamsDefinitions from '@shared/constants/reb-parameters-definitions.ts';
import type { TimeUnit } from '@shared/models/time-unit.ts';
import { ImportStatus } from '@shared/models/import-status.ts';
import { ParsedRebReport } from 'src/models/parsed-reb-report.ts';
import { ParsedRebParameter } from 'src/models/parsed-reb-parameter.ts';
import {
  extractExpert,
  extractValue,
  getLinesSection,
  parseParameterValue,
  requiredValue,
} from './parser-helper.ts';
import { BacktestPassResult } from '@shared/models/backtest-pass-result.ts';
import { BacktestPassParameter } from '@shared/models/backtest-pass-parameter.ts';
import { BacktestPass } from '@shared/models/backtest-pass.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';

export async function parseRebReport(filePath: string): Promise<{
  report: ParsedRebReport;
  parameters: ParsedRebParameter[];
}> {
  const { content, lines, expert, fixedParameters, passParameters } = await parseRebFile(filePath);

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
  const variableParameters = consolidatePassParameters(passParameters);

  return {
    report: {
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
    parameters: [...fixedParameters, ...variableParameters],
  };
}

export async function parseRebPass(filePath: string): Promise<BacktestPass[]> {
  const { content, fixedParameters, passParameters } = await parseRebFile(filePath);

  const passIds = getLinesSection(content, 'SENS DES PASSAGES').map((id) => +id);
  const passShortTermResults = parseResults(content, 'RESULTATS COURT TERME');
  const passLongTermResults = parseResults(content, 'RESULTATS LONG TERME');

  const fixedPassParameters = fixedParameters.map((p) => ({
    name: p.name,
    value: p.values[0],
    fixed: true,
  }));

  const passes: BacktestPass[] = passIds.map((passId, index) => {
    const parameters: BacktestPassParameter[] = [
      ...fixedPassParameters,
      ...passParameters[index].map((p) => ({ ...p, fixed: false })),
    ];

    return {
      id: passId,
      parameters,
      shortTermResults: passShortTermResults[index],
      longTermResults: passLongTermResults[index],
    };
  });

  return passes;
}

async function parseRebFile(filePath: string): Promise<{
  content: string;
  lines: string[];
  expert: ExpertAdvisor;
  fixedParameters: ParsedRebParameter[];
  passParameters: {
    name: string;
    value: number;
  }[][];
}> {
  const content = await readFile(filePath, { encoding: 'utf-8' });
  const lines = content.split(/\r?\n/);
  const expert = extractExpert(lines);
  const allowedParameters = rebParamsDefinitions.EXPERT_PARAMETERS[expert] ?? [];

  const fixedParameters = parseFixedParameters(content, allowedParameters);
  const passParameters = parsePassParameters(content);

  return { content, lines, expert, fixedParameters, passParameters };
}

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

function parseFixedParameters(content: string, allowed: string[]): ParsedRebParameter[] {
  const lines = getLinesSection(content, 'PARAMETRES OPTIMISATION');

  const parameters: ParsedRebParameter[] = [];

  for (const line of lines.filter((line) => line.includes('='))) {
    const trimmed = line.trim();
    const parts = trimmed.split('=');
    const name = parts[0].trim();

    if (!allowed.includes(name)) continue;

    const values = parts[1].split('||');
    const optimized = values[4] === 'Y';

    if (!optimized) {
      parameters.push({
        name,
        values: [parseParameterValue(values[0])],
      });
    }
  }

  return parameters;
}

function parsePassParameters(content: string): { name: string; value: number }[][] {
  const lines = getLinesSection(content, 'PARAMETRES IMPORT');

  return lines.map((line) => {
    const parts = line
      .split(';;')
      .map((p) => p.trim())
      .filter((p) => p);

    return parts
      .map((part) => {
        const match = part.match(/^::(\w+)=(.+)$/);
        if (match) {
          return { name: match[1], value: parseParameterValue(match[2]) };
        }
        return null;
      })
      .filter((p) => !!p);
  });
}

function parseResults(content: string, section: string): BacktestPassResult[][] {
  const lines = getLinesSection(content, section);

  return lines.map((line) => {
    const rawValues = line
      .split(';;')
      .map((part) => part.replace(/^::/, '').trim())
      .filter((part) => part !== '')
      .map((value) => +value);

    return mapToPassResults(rawValues);
  });
}

function mapToPassResults(values: number[]): BacktestPassResult[] {
  const metricsPerPass = 6;
  const results: BacktestPassResult[] = [];

  for (let i = 0; i < values.length; i += metricsPerPass) {
    const slice = values.slice(i, i + metricsPerPass);

    if (slice.length === metricsPerPass) {
      const [result, trades, profitFactor, resultPerTrade, drawdownAmount, drawdownPercent] = slice;

      results.push({
        result,
        trades,
        profitFactor,
        resultPerTrade,
        drawdownAmount,
        drawdownPercent,
      });
    }
  }

  return results;
}

function consolidatePassParameters(
  parameters: { name: string; value: number }[][],
): ParsedRebParameter[] {
  const map = new Map<string, Set<number>>();

  for (const group of parameters) {
    for (const param of group) {
      if (!map.has(param.name)) {
        map.set(param.name, new Set());
      }
      map.get(param.name)!.add(param.value);
    }
  }

  return Array.from(map.entries()).map(([name, valuesSet]) => ({
    name,
    values: Array.from(valuesSet).sort((a, b) => a - b),
  }));
}
