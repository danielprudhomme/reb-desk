import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { basename } from 'path';

export function extractValue(lines: string[], key: string): string | undefined {
  const idx = lines.findIndex((l) => l.trim() === key);
  return idx === -1 ? undefined : lines[idx + 1].trim();
}

export function requiredValue(lines: string[], key: string): string {
  const value = extractValue(lines, key);
  if (!value) {
    throw new Error(`Missing value for ${key}`);
  }
  return value;
}

export function extractExpert(lines: string[]): ExpertAdvisor {
  const expertName = requiredValue(lines, 'NOM EXPERT :');
  const file = basename(expertName)
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

export function parseParameterValue(raw: string): number {
  const v = raw.trim().toLowerCase();

  if (v === 'true') return 1;
  if (v === 'false') return 0;

  const num = parseFloat(v);

  if (Number.isNaN(num)) {
    throw new Error(`Invalid numeric value: ${raw}`);
  }

  return num;
}

export function getLinesSection(content: string, section: string): string[] {
  const start = content.indexOf(`==${section}==`);
  const end = content.indexOf(`==FIN ${section}==`);

  if (start === -1 || end === -1) return [];

  const block = content.slice(start + `==${section}==`.length, end);
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line);

  return lines;
}
