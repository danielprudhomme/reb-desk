// import definitions from '@shared/constants/backtest-threshold-definitions.ts';
import { BacktestThreshold } from '@shared/models/backtest-threshold.js';
import { collections } from 'src/db/collections.ts';
import { parseRebFileForPass } from './parser/reb-report-pass.parser.ts';
import { BacktestPass } from 'src/models/backtest-pass.ts';
import { BacktestPassResult } from 'src/models/backtest-pass-result.ts';

export async function runAnalysis(reportId: string) {
  const report = collections.RebReport().findOne({ id: reportId });

  if (!report) {
    throw new Error(`Report not found for id ${reportId}`);
  }

  const passes = await parseRebFileForPass(report.path);
  const validPasses = filterPasses(passes, thresholds, report.capital);

  console.log(`Valid passes: ${validPasses.length}`);
}

export function filterPasses(
  passes: BacktestPass[],
  thresholds: BacktestThreshold[],
  capital: number,
): BacktestPass[] {
  return passes.filter((pass) =>
    thresholds.every((threshold) => checkThreshold(pass, threshold, capital)),
  );
}

function compare(value: number, operator: '>' | '<', threshold: number): boolean {
  return operator === '>' ? value > threshold : value < threshold;
}

function getValue(
  type: BacktestThreshold['type'],
  passResult: BacktestPassResult,
  capital: number,
): number {
  switch (type) {
    case 'shortTermPassResultPercent':
    case 'longTermResultPercent':
      return (passResult.result / capital) * 100;

    case 'shortTermTrades':
      return passResult.trades;

    case 'longTermGainLossRatio':
      return passResult.result / passResult.drawdownAmount;

    case 'shortTermDrawdownPercent':
      return passResult.drawdownPercent;

    case 'longTermDrawdownAmount':
      return passResult.drawdownAmount;

    default:
      return 0;
  }
}

function checkThreshold(
  pass: BacktestPass,
  threshold: BacktestThreshold,
  capital: number,
): boolean {
  const isLongTerm = threshold.type.startsWith('longTerm');

  const results = isLongTerm ? pass.longTermResults : pass.shortTermResults;

  if (!results.length) return false;

  const validCount = results.filter((r) =>
    compare(getValue(threshold.type, r, capital), threshold.operator, threshold.value),
  ).length;

  const rate = (validCount / results.length) * 100;

  return rate >= threshold.passRate;
}

// A envoyer dans la requête - pas hardcodé
const thresholds: BacktestThreshold[] = [
  {
    type: 'longTermResultPercent',
    operator: '>',
    value: 0,
    passRate: 100, // toujours 100% pour LT
  },
  {
    type: 'shortTermPassResultPercent',
    operator: '>',
    value: 0,
    passRate: 80, // ex. passage validé si ≥ 80% des passages CT respectent ce seuil
  },
  {
    type: 'longTermGainLossRatio',
    operator: '>',
    value: 1,
    passRate: 100, // LT
  },
  {
    type: 'shortTermTrades',
    operator: '>',
    value: 1,
    passRate: 100, // peut être 100% ou moins selon ta logique
  },
  {
    type: 'shortTermDrawdownPercent',
    operator: '<',
    value: 15,
    passRate: 80, // validé si 80% des passages CT respectent le seuil
  },
  {
    type: 'longTermDrawdownAmount',
    operator: '<',
    value: 550,
    passRate: 100, // LT
  },
];
