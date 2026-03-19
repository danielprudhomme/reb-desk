import { ParsedRebParameter } from 'src/models/parsed-reb-parameter.ts';
import { parseParameterValue } from './parser-helper.ts';

export function parseParameters(content: string, allowed: string[]): ParsedRebParameter[] {
  const start = content.indexOf('==PARAMETRES OPTIMISATION==');
  const end = content.indexOf('==FIN PARAMETRES OPTIMISATION==');

  if (start === -1 || end === -1) return [];

  const block = content.slice(start, end);
  const lines = block.split(/\r?\n/);

  const parameters: ParsedRebParameter[] = [];

  for (const line of lines.filter((line) => line.includes('='))) {
    const trimmed = line.trim();
    const parts = trimmed.split('=');
    const name = parts[0].trim();

    if (!allowed.includes(name)) continue;

    const values = parts[1].split('||');
    const optimized = values[4] === 'Y';

    if (optimized) {
      parameters.push({
        name,
        start: parseParameterValue(values[1]),
        step: parseParameterValue(values[2]),
        stop: parseParameterValue(values[3]),
      });
    } else {
      parameters.push({
        name,
        value: parseParameterValue(values[0]),
      });
    }
  }

  return parameters;
}
