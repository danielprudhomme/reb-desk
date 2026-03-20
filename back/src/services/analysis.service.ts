// import definitions from '@shared/constants/backtest-threshold-definitions.ts';
import { BacktestThreshold } from '@shared/models/backtest-threshold.js';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.js';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.js';
import { collections } from 'src/db/collections.ts';
import { parseRebFileForPass } from './parser/reb-report-pass.parser.ts';
import { BacktestPass } from 'src/models/backtest-pass.ts';
import { BACKTEST_THRESHOLD_PROPERTIES } from 'src/constants/backtest-threshold.constants.ts';

export async function runAnalysis(reportId: string) {
  const report = collections.RebReport().findOne({ id: reportId });

  if (!report) {
    throw new Error(`Report not found for id ${reportId}`);
  }

  const passes = await parseRebFileForPass(report.path);
  const analysis = analyzePasses(passes, thresholds, report.capital);

  const validPasses = analysis
    .filter((a) => a.ok)
    .map((a) => passes.find((p) => p.id === a.passId)!);

  console.log(`Valid passes: ${validPasses.length}`);
  console.log(`analysis: ${JSON.stringify(analysis[0])}`);
}

export function analyzePasses(
  passes: BacktestPass[],
  thresholds: BacktestThreshold[],
  capital: number,
): BacktestPassAnalysis[] {
  return passes.map((pass) => {
    const checks = thresholds.map((threshold) => checkThreshold(pass, threshold, capital));

    const ok = checks.every((c) => c.ok);

    return {
      passId: pass.id,
      ok,
      checks,
    };
  });
}

function compare(value: number, operator: '>' | '<', threshold: number): boolean {
  return operator === '>' ? value > threshold : value < threshold;
}

function checkThreshold(
  pass: BacktestPass,
  threshold: BacktestThreshold,
  capital: number,
): BacktestThresholdCheck {
  const values = BACKTEST_THRESHOLD_PROPERTIES[threshold.type](pass, capital);

  if (!values.length) {
    return {
      type: threshold.type,
      ok: false,
      worstValue: 0,
      rate: 0,
      requiredRate: threshold.passRate,
    };
  }

  const validCount = values.filter((v) => compare(v, threshold.operator, threshold.value)).length;
  const rate = (validCount / values.length) * 100;

  return {
    type: threshold.type,
    ok: rate >= threshold.passRate,
    worstValue: threshold.operator === '>' ? Math.min(...values) : Math.max(...values),
    rate,
    requiredRate: threshold.passRate,
  };
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
    type: 'shortTermResultPercent',
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
