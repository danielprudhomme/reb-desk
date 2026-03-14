import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { RebReport } from '@shared/models/reb-report.ts';
import type { Currency } from '@shared/models/currency.ts';
import type { OpitmizationModel } from '@shared/models/optimization-model.ts';
import type { TimeUnit } from '@shared/models/time-unit.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';

function extractValue(lines: string[], key: string): string {
  const idx = lines.findIndex((l) => l.trim() === key);
  if (idx === -1) throw new Error(`Key not found: ${key}`);
  return lines[idx + 1].trim();
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

function parseModel(value: string): OpitmizationModel {
  if (value.toLowerCase().includes('ouverture') || value.toLowerCase().includes('opening')) {
    return 'openingPriceOnly';
  }
  throw new Error(`Unknown model: ${value}`);
}

function extractExpert(nomExpert: string): ExpertAdvisor {
  const file = basename(nomExpert)
    .replace(/\.ex5$/i, '')
    .replace(/\.ex4$/i, '');

  const map: Record<string, ExpertAdvisor> = {
    'REB Candle-Suite': 'candleSuite',
    'REB EMA-BB': 'emaBb',
    'REB Ichimoku-Bot': 'ichimoku',
    'REB RSI-Break': 'rsiBreak',
    'REB Strategy Creator': 'strategyCreator',
    'REB AutoBot': 'autoBot',
  };

  const expert = map[file];

  if (!expert) {
    throw new Error(`Unknown expert advisor: ${file}`);
  }

  return expert;
}

function parseStartDate(value: string): string {
  // DD/MM/YYYY → YYYY-MM-DD
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

export async function parseRebFile(filePath: string): Promise<Omit<RebReport, 'id'>> {
  const content = await readFile(filePath, { encoding: 'utf-8' });
  const lines = content.split(/\r?\n/);

  return {
    path: filePath,
    expert: extractExpert(extractValue(lines, 'NOM EXPERT :')),
    symbol: extractValue(lines, 'SYMBOLE :'),
    timeframe: extractValue(lines, 'UNITE DE TEMPS :'),
    leverage: parseInt(extractValue(lines, 'SPREAD :')),
    capital: parseFloat(extractValue(lines, 'CAPITAL :')),
    currency: parseCurrency(extractValue(lines, 'DEVISE :')),
    model: parseModel(extractValue(lines, "MODELE D'OPTIMISATION :")),
    startDate: parseStartDate(extractValue(lines, 'DATE DE DEBUT TESTS :')),
    shortTermCount: parseInt(extractValue(lines, 'NOMBRE DE COURT TERME :')),
    shortTermDuration: parseInt(extractValue(lines, 'DUREE COURT TERME :')),
    shortTermUnit: parseTimeUnit(extractValue(lines, 'UNITE COURT TERME :')),
    longTermDuration: parseInt(extractValue(lines, 'DUREE LONG TERME :')),
    longTermUnit: parseTimeUnit(extractValue(lines, 'UNITE LONG TERME :')),
  };
}
