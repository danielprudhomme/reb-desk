import { BacktestThreshold } from '@shared/models/backtest-threshold.ts';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.ts';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.ts';
import { collections } from '../db/collections.ts';
import { BacktestPass } from '@shared/models/backtest-pass.ts';
import { ReportFilter } from '@shared/models/report-filter.ts';
import { parseRebPass } from './parser/reb-report.parser.ts';
import { RebReport } from '../db/models/reb-report.ts';
import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';
import { BACKTEST_THRESHOLD_COMPUTE } from '../constants/backtest-threshold.constants.ts';
import valueTypeConst from '@shared/constants/backtest-threshold-value-type.ts';

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
  const { analyzedPasses, valuesByType } = runChecks(report, passes, thresholds);
  computeScore(analyzedPasses, thresholds, valuesByType);
  return analyzedPasses;
}

export function runChecks(
  report: RebReport,
  passes: BacktestPass[],
  thresholds: BacktestThreshold[],
): {
  analyzedPasses: BacktestPassAnalysis[];
  valuesByType: Record<BacktestThresholdType, { worstValues: number[]; min: number; max: number }>;
} {
  const valuesByType: Record<
    BacktestThresholdType,
    { worstValues: number[]; min: number; max: number }
  > = {} as Record<BacktestThresholdType, { worstValues: number[]; min: number; max: number }>;

  const analyzedPasses: BacktestPassAnalysis[] = passes.map((pass) => {
    const checks: BacktestThresholdCheck[] = thresholds.map((threshold) => {
      const compute = BACKTEST_THRESHOLD_COMPUTE[threshold.type];
      const passValues = compute(pass, report.capital);

      const validCount = passValues.filter((value) =>
        threshold.operator === '>' ? value > threshold.value : value < threshold.value,
      ).length;
      const rate = (validCount / passValues.length) * 100;
      const ok = rate >= threshold.passRate;

      const worstValue =
        threshold.operator === '>' ? Math.min(...passValues) : Math.max(...passValues);
      const averageValue = passValues.reduce((acc, v) => acc + v, 0) / passValues.length;
      const bestValue =
        threshold.operator === '>' ? Math.max(...passValues) : Math.min(...passValues);

      if (ok) {
        const values = valuesByType[threshold.type];
        if (values) {
          values.worstValues.push(worstValue);
          values.min = Math.min(values.min, worstValue);
          values.max = Math.max(values.max, worstValue);
        } else {
          valuesByType[threshold.type] = {
            worstValues: [worstValue],
            min: worstValue,
            max: worstValue,
          };
        }
      }

      return {
        type: threshold.type,
        ok,
        worstValue,
        averageValue,
        bestValue,
        rate,
        requiredRate: threshold.passRate,
        score: 0,
      };
    });

    return {
      ok: false,
      checks,
      score: 0,
      reportId: report.id,
      passId: pass.id,
      parameters: pass.parameters,
      longTermResults: pass.longTermResults,
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

  return { analyzedPasses, valuesByType };
}

export function computeScore(
  analyzedPasses: BacktestPassAnalysis[],
  thresholds: BacktestThreshold[],
  valuesByType: Record<BacktestThresholdType, { worstValues: number[]; min: number; max: number }>,
) {
  const thresholdsMap: Record<BacktestThresholdType, BacktestThreshold> = Object.fromEntries(
    thresholds.map((t) => [t.type, t]),
  ) as Record<BacktestThresholdType, BacktestThreshold>;

  analyzedPasses.forEach((pass) => {
    pass.checks.forEach((check) => {
      const { min, max } = valuesByType[check.type];

      if (!min || min === max) {
        return;
      }

      const threshold = thresholdsMap[check.type];

      // ===== CAS 1 : OK =====
      if (check.ok) {
        computeScoreWhenCheckOk(check, threshold, min, max);
      }
      // ===== CAS 2 : MARGE (uniquement pour rate) =====
      else if (valueTypeConst.BACKTEST_THRESHOLD_VALUE_TYPE[threshold.type] === 'rate') {
        computeScoreNotOkForRate(check, threshold);
      }
      // ===== CAS 2 BIS : MARGE pour VALUE =====
      else {
        computeScoreNotOkForValue(check, threshold);
      }
    });

    const ok = pass.checks.every((c) => c.score > 0);

    const totalWeight = pass.checks.reduce(
      (acc, c) => acc + (thresholdsMap[c.type].weight ?? 1),
      0,
    );
    const score =
      pass.checks.reduce((acc, c) => acc + c.score * (thresholdsMap[c.type].weight ?? 1), 0) /
      totalWeight;

    const hasCriticalFail = pass.checks.some(
      (c) => !c.ok && (thresholds.find((t) => t.type === c.type)?.weight ?? 1) >= 3,
    );
    const finalScore = !ok ? (hasCriticalFail ? score * 0.5 : score * 0.75) : score;

    pass.ok = ok;
    pass.score = finalScore;
  });
}

export function computeScoreWhenCheckOk(
  check: BacktestThresholdCheck,
  threshold: BacktestThreshold,
  min: number,
  max: number,
) {
  let normalized =
    threshold.operator === '>'
      ? (check.worstValue - min) / (max - min)
      : (max - check.worstValue) / (max - min);

  normalized = Math.max(0, Math.min(1, normalized));

  check.score = 0.5 + 0.5 * Math.pow(normalized, 2);
}

export function computeScoreNotOkForRate(
  check: BacktestThresholdCheck,
  threshold: BacktestThreshold,
) {
  const margin = threshold.passRate * 0.1;
  const minAcceptableRate = threshold.passRate - margin;

  if (check.rate >= minAcceptableRate) {
    const normalized = (check.rate - minAcceptableRate) / (threshold.passRate - minAcceptableRate);

    // score entre 0 → 0.5
    check.score = 0.5 * Math.pow(normalized, 2);
  }
}

export function computeScoreNotOkForValue(
  check: BacktestThresholdCheck,
  threshold: BacktestThreshold,
) {
  if (check.rate < threshold.passRate * 0.5) return;

  const margin = threshold.value * 0.1; // 10%

  if (threshold.operator === '<') {
    const maxAcceptable = threshold.value + margin;

    if (check.worstValue <= maxAcceptable) {
      const normalized = (maxAcceptable - check.worstValue) / (maxAcceptable - threshold.value);

      check.score = 0.5 * Math.pow(Math.max(0, Math.min(1, normalized)), 2);
    }
  } else {
    const minAcceptable = threshold.value - margin;

    if (check.worstValue >= minAcceptable) {
      const normalized = (check.worstValue - minAcceptable) / (threshold.value - minAcceptable);

      check.score = 0.5 * Math.pow(Math.max(0, Math.min(1, normalized)), 2);
    }
  }
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
    value: 400,
    passRate: 100,
    weight: 1,
  },
];
