import { readFile } from 'node:fs/promises';
import { extractExpert, parseParameterValue } from './parser-helper.ts';
import rebParamsDefinitions from '@shared/constants/reb-parameters-definitions.ts';
import { parseParameters } from './reb-parameter.parser.ts';
import { BacktestPassParameter } from 'src/models/backtest-pass-parameter.ts';
import { BacktestPass } from 'src/models/backtest-pass.ts';
import { BacktestPassResult } from 'src/models/backtest-pass-result.ts';

export async function parseRebFileForPass(filePath: string): Promise<boolean> {
  console.log(filePath);
  const content = await readFile(filePath, { encoding: 'utf-8' });
  const lines = content.split(/\r?\n/);

  const expert = extractExpert(lines);
  const allowedParameters = rebParamsDefinitions.EXPERT_PARAMETERS[expert] ?? [];
  const parameters = parseParameters(content, allowedParameters);
  const fixedParameters = parameters.filter((x) => !!x.value);

  const passesId = parsePasses(content);
  const passParameters = parsePassParameters(content);
  const passShortTermResults = parseShortTermResults(content);
  const passLongTermResults = parseLongTermResults(content);

  if (passesId.length !== passParameters.length) {
    throw new Error('Passes and parameters length do not match');
  }

  const passes: BacktestPass[] = passesId.map((passId, index) => {
    return {
      id: +passId,
      parameters: [...fixedParameters, ...passParameters[index]],
      shortTermResults: passShortTermResults[index],
      longTermResults: passLongTermResults[index],
    };
  });

  console.log('ppp', passes[0].longTermResults[0]);

  return true;
}

export function parsePasses(content: string): string[] {
  const start = content.indexOf('==SENS DES PASSAGES==');
  const end = content.indexOf('==FIN SENS DES PASSAGES==');

  if (start === -1 || end === -1) return [];

  const block = content.slice(start + '==SENS DES PASSAGES=='.length, end);
  const passesId = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line);

  return passesId;
}

function parsePassParameters(content: string): BacktestPassParameter[][] {
  const start = content.indexOf('==PARAMETRES IMPORT==');
  const end = content.indexOf('==FIN PARAMETRES IMPORT==');

  if (start === -1 || end === -1) return [];

  const block = content.slice(start + '==PARAMETRES IMPORT=='.length, end);
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line);

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

function parseShortTermResults(content: string): BacktestPassResult[][] {
  return parseResults(content, '==RESULTATS COURT TERME==', '==FIN RESULTATS COURT TERME==');
}

function parseLongTermResults(content: string): BacktestPassResult[][] {
  return parseResults(content, '==RESULTATS LONG TERME==', '==FIN RESULTATS LONG TERME==');
}

function parseResults(content: string, startStr: string, endStr: string): BacktestPassResult[][] {
  const start = content.indexOf(startStr);
  const end = content.indexOf(endStr);

  if (start === -1 || end === -1) return [];

  const block = content.slice(start + '==RESULTATS COURT TERME=='.length, end);

  const lines = block
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l);

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
