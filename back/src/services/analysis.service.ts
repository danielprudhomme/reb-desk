import { BacktestThreshold } from '@shared/models/backtest-threshold.ts';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.ts';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.ts';
import { collections } from 'src/db/collections.ts';
import { BacktestPass } from '@shared/models/backtest-pass.ts';
import { ReportFilter } from '@shared/models/report-filter.ts';
import { BACKTEST_THRESHOLD_PROPERTIES } from 'src/constants/backtest-threshold.constants.ts';
import { parseRebPass } from './parser/reb-report.parser.ts';
import { RebReport } from 'src/db/models/reb-report.ts';

export async function runAnalysis(filter: ReportFilter): Promise<BacktestPassAnalysis[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (filter.reportId) {
    query.id = filter.reportId;
  } else {
    if (filter.experts?.length) {
      query.expert = { $in: filter.experts };
    }

    if (filter.symbols?.length) {
      query.symbol = { $in: filter.symbols };
    }

    if (filter.timeframes?.length) {
      query.timeframe = { $in: filter.timeframes };
    }
  }

  const reports = collections.RebReport().find(query);

  if (!reports.length) {
    throw new Error('No reports found for given filters');
  }

  const analysis: BacktestPassAnalysis[] = [];

  for (const report of reports) {
    const passes = await parseRebPass(report.path);
    analysis.push(...analyzePasses(report, passes, thresholds));
  }

  return analysis;
}

export function analyzePasses(
  report: RebReport,
  passes: BacktestPass[],
  thresholds: BacktestThreshold[],
): BacktestPassAnalysis[] {
  return passes.map((pass) => {
    const checks = thresholds.map((threshold) => checkThreshold(pass, threshold, report.capital));
    const ok = checks.every((c) => c.ok);

    const weightMap = Object.fromEntries(thresholds.map((t) => [t.type, t.weight ?? 1]));
    const totalWeight = checks.reduce((acc, c) => acc + weightMap[c.type], 0);
    const score = checks.reduce((acc, c) => acc + c.score * weightMap[c.type], 0) / totalWeight;

    const hasCriticalFail = checks.some(
      (c) => !c.ok && (thresholds.find((t) => t.type === c.type)?.weight ?? 1) >= 3,
    );
    const finalScore = hasCriticalFail ? score * 0.7 : score;

    return {
      ...pass,
      ok,
      checks,
      score: finalScore,
      expert: report.expert,
      symbol: report.symbol,
      timeframe: report.timeframe,
      capital: report.capital,
      shortTermCount: report.shortTermCount,
      shortTermDuration: report.shortTermDuration,
      shortTermUnit: report.shortTermUnit,
      longTermDuration: report.longTermDuration,
      longTermUnit: report.longTermUnit,
    };
  });
}

function compare(value: number, operator: '>' | '<', threshold: number): boolean {
  return operator === '>' ? value > threshold : value < threshold;
}

/**
 * compute a "smart" score for a single value
 * score = 1 if value is excellent
 * score = 0 if value is clearly bad
 * score in (0,1) if value is near threshold
 */
function computeValueScore(value: number, threshold: BacktestThreshold): number {
  const { operator, value: thresoldValue } = threshold;

  const margin = thresoldValue * 0.2; // 20% margin
  if (operator === '>') {
    if (value >= thresoldValue + margin) return 1; // clearly excellent
    if (value >= thresoldValue) return 0.7 + (0.3 * (value - thresoldValue)) / margin; // slightly above thresoldValue
    if (value >= thresoldValue - margin)
      return 0.4 + (0.3 * (value - (thresoldValue - margin))) / margin; // slightly below
    return 0; // clearly below
  } else {
    // '<'
    if (value <= thresoldValue - margin) return 1; // clearly excellent
    if (value <= thresoldValue) return 0.7 + (0.3 * (thresoldValue - value)) / margin; // slightly below thresoldValue
    if (value <= thresoldValue + margin)
      return 0.4 + (0.3 * (thresoldValue + margin - value)) / margin; // slightly above thresoldValue
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
  const valueScores = values.map((v) => computeValueScore(v, threshold));

  // aggregate into threshold score:
  // - average score
  // - penalize 1 outlier slightly less if rest are good (reward regularity)
  const avgScore = valueScores.reduce((a, b) => a + b, 0) / valueScores.length;
  const minScore = Math.min(...valueScores);

  // simple rule: if minScore very low but avgScore high, keep avgScore * 0.8
  // const score = minScore < 0.5 && avgScore > 0.7 ? avgScore * 0.8 : avgScore;

  const ok = rate >= threshold.passRate;
  const score = ok ? minScore : 0;

  return {
    type: threshold.type,
    ok,
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
    passRate: 100,
    weight: 3,
  },
  {
    type: 'shortTermResultPercent',
    operator: '>',
    value: 0,
    passRate: 80,
    weight: 1,
  },
  {
    type: 'longTermGainLossRatio',
    operator: '>',
    value: 1,
    passRate: 100,
    weight: 3,
  },
  {
    type: 'shortTermTrades',
    operator: '>',
    value: 1,
    passRate: 100,
    weight: 0.5,
  },
  {
    type: 'shortTermDrawdownPercent',
    operator: '<',
    value: 15,
    passRate: 80,
    weight: 1,
  },
  {
    type: 'longTermDrawdownAmount',
    operator: '<',
    value: 550,
    passRate: 100,
    weight: 1,
  },
];
