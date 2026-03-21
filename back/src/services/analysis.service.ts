// import definitions from '@shared/constants/backtest-threshold-definitions.ts';
import { BacktestThreshold } from '@shared/models/backtest-threshold.js';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.js';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.js';
import { collections } from 'src/db/collections.ts';
import { parseRebFileForPass } from './parser/reb-report-pass.parser.ts';
import { BacktestPass } from '@shared/models/backtest-pass.ts';
import { BACKTEST_THRESHOLD_PROPERTIES } from 'src/constants/backtest-threshold.constants.ts';

export async function runAnalysis(reportId: string): Promise<BacktestPassAnalysis[]> {
  const report = collections.RebReport().findOne({ id: reportId });

  if (!report) {
    throw new Error(`Report not found for id ${reportId}`);
  }

  const passes = await parseRebFileForPass(report.path);
  const analysis = analyzePasses(passes, thresholds, report.capital);

  return analysis;
}

export function analyzePasses(
  passes: BacktestPass[],
  thresholds: BacktestThreshold[],
  capital: number,
): BacktestPassAnalysis[] {
  return passes.map((pass) => {
    const checks = thresholds.map((threshold) => checkThreshold(pass, threshold, capital));
    const ok = checks.every((c) => c.ok);
    // totalScore = moyenne des scores des critères
    const score = checks.reduce((acc, c) => acc + c.score, 0) / checks.length;
    return { ...pass, ok, checks, score };
  });
}

/**
 * compare simple > / <
 */
function compare(value: number, operator: '>' | '<', threshold: number): boolean {
  return operator === '>' ? value > threshold : value < threshold;
}

/**
 * compute a "smart" score for a single value
 * score = 1 if value is excellent
 * score = 0 if value is clearly bad
 * score in (0,1) if value is near threshold
 */
function computeValueScore(value: number, threshold: number, operator: '>' | '<'): number {
  const margin = operator === '>' ? threshold * 0.2 : threshold * 0.2; // 20% margin
  if (operator === '>') {
    if (value >= threshold + margin) return 1; // clearly excellent
    if (value >= threshold) return 0.7 + (0.3 * (value - threshold)) / margin; // slightly above threshold
    if (value >= threshold - margin) return 0.4 + (0.3 * (value - (threshold - margin))) / margin; // slightly below
    return 0; // clearly below
  } else {
    // '<'
    if (value <= threshold - margin) return 1; // clearly excellent
    if (value <= threshold) return 0.7 + (0.3 * (threshold - value)) / margin; // slightly below threshold
    if (value <= threshold + margin) return 0.4 + (0.3 * (threshold + margin - value)) / margin; // slightly above threshold
    return 0; // clearly bad
  }
}

/**
 * check a single threshold for a pass
 * returns ok, worstValue, rate, and score [0..1]
 */
function checkThreshold(
  pass: BacktestPass,
  threshold: BacktestThreshold,
  capital: number,
): BacktestThresholdCheck {
  // get all values for this threshold
  const values = BACKTEST_THRESHOLD_PROPERTIES[threshold.type](pass, capital);

  if (!values.length) {
    return {
      type: threshold.type,
      ok: false,
      worstValue: 0,
      rate: 0,
      requiredRate: threshold.passRate,
      score: 0,
    };
  }

  const validCount = values.filter((v) => compare(v, threshold.operator, threshold.value)).length;
  const rate = (validCount / values.length) * 100;

  // compute per-value scores
  const valueScores = values.map((v) => computeValueScore(v, threshold.value, threshold.operator));

  // aggregate into threshold score:
  // - average score
  // - penalize 1 outlier slightly less if rest are good (reward regularity)
  const avgScore = valueScores.reduce((a, b) => a + b, 0) / valueScores.length;
  const minScore = Math.min(...valueScores);

  // simple rule: if minScore very low but avgScore high, keep avgScore * 0.8
  const score = minScore < 0.5 && avgScore > 0.7 ? avgScore * 0.8 : avgScore;

  return {
    type: threshold.type,
    ok: rate >= threshold.passRate,
    worstValue: threshold.operator === '>' ? Math.min(...values) : Math.max(...values),
    rate,
    requiredRate: threshold.passRate,
    score,
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
