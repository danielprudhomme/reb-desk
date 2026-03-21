import { readFile } from 'node:fs/promises';
import { extractExpert, getLinesSection, parseParameterValue } from './parser-helper.ts';
import rebParamsDefinitions from '@shared/constants/reb-parameters-definitions.ts';
import { parseParameters } from './reb-parameter.parser.ts';
import { BacktestPassParameter } from '@shared/models/backtest-pass-parameter.ts';
import type { BacktestPassResult } from '@shared/models/backtest-pass-result.ts';
import type { BacktestPass } from '@shared/models/backtest-pass.ts';

export async function parseRebFileForPass(filePath: string): Promise<BacktestPass[]> {
  const content = await readFile(filePath, { encoding: 'utf-8' });
  const lines = content.split(/\r?\n/);

  const expert = extractExpert(lines);
  const allowedParameters = rebParamsDefinitions.EXPERT_PARAMETERS[expert] ?? [];
  const parameters = parseParameters(content, allowedParameters);
  const fixedParameters = parameters
    .filter((x) => !!x.value)
    .map((x) => ({ name: x.name, value: x.value!, fixed: true }));

  const passIds = getLinesSection(content, 'SENS DES PASSAGES').map((id) => +id);
  const passParameters = parsePassParameters(content);
  const passShortTermResults = parseResults(content, 'RESULTATS COURT TERME');
  const passLongTermResults = parseResults(content, 'RESULTATS LONG TERME');

  const passes: BacktestPass[] = passIds.map((passId, index) => {
    return {
      id: passId,
      parameters: [...fixedParameters, ...passParameters[index]],
      shortTermResults: passShortTermResults[index],
      longTermResults: passLongTermResults[index],
    };
  });

  return passes;
}

function parsePassParameters(content: string): BacktestPassParameter[][] {
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
          return { name: match[1], value: parseParameterValue(match[2]), fixed: false };
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
