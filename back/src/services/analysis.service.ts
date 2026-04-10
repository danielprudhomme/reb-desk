import { BacktestThreshold } from '@shared/models/backtest-threshold.ts';
import { BacktestThresholdCheck } from '@shared/models/backtest-threshold-check.ts';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.ts';
import { collections } from 'src/db/collections.ts';
import { BacktestPass } from '@shared/models/backtest-pass.ts';
import { ReportFilter } from '@shared/models/report-filter.ts';
import { BACKTEST_THRESHOLD_PROPERTIES } from 'src/constants/backtest-threshold.constants.ts';
import { parseRebPass } from './parser/reb-report.parser.ts';
import { RebReport } from 'src/db/models/reb-report.ts';
import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';

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

    analysis.push(
      ...analyzePasses2(
        report,
        passes, //.filter((x) => x.id == 157),
        thresholds,
      ),
    );
  }

  return analysis;
}

export function analyzePasses2(
  report: RebReport,
  passes: BacktestPass[],
  thresholds: BacktestThreshold[],
): BacktestPassAnalysis[] {
  // pour chaque threshold, j'ai besoin de toutes les pires valeurs de chaque passage
  const worstValidValuesByType: Record<BacktestThresholdType, number[]> = {} as Record<
    BacktestThresholdType,
    number[]
  >;

  const checkPasses: Record<string, BacktestThresholdCheck[]> = {} as Record<
    string,
    BacktestThresholdCheck[]
  >;

  passes.forEach((pass) => {
    thresholds.forEach((threshold) => {
      const { compute } = BACKTEST_THRESHOLD_PROPERTIES[threshold.type];
      const passValues = compute(pass, report.capital);

      const validCount = passValues.filter((value) =>
        threshold.operator === '>' ? value > threshold.value : value < threshold.value,
      ).length;
      const rate = (validCount / passValues.length) * 100;
      const ok = rate >= threshold.passRate;

      const worstValue =
        threshold.operator === '>' ? Math.min(...passValues) : Math.max(...passValues);

      if (ok) {
        (worstValidValuesByType[threshold.type] ??= []).push(worstValue);
      }

      const check: BacktestThresholdCheck = {
        type: threshold.type,
        ok,
        worstValue,
        rate,
        requiredRate: threshold.passRate,
        score: 0,
      };

      (checkPasses[pass.id] ??= []).push(check);
    });
  });

  const minMaxByType: Record<BacktestThresholdType, { min: number; max: number }> = {} as Record<
    BacktestThresholdType,
    { min: number; max: number }
  >;

  Object.entries(worstValidValuesByType).forEach(([type, values]) => {
    minMaxByType[type as BacktestThresholdType] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  return passes.map((pass) => {
    const checkByType = Object.fromEntries(checkPasses[pass.id].map((c) => [c.type, c]));

    const checks = thresholds.map((threshold) => {
      const check = checkByType[threshold.type];

      const minMax = minMaxByType[threshold.type];

      // ❌ Si KO → score = 0
      if (!check.ok || !minMax || minMax.min === minMax.max) {
        check.score = 0;
        return check;
      }

      let normalized: number;

      if (threshold.operator === '>') {
        // plus grand = meilleur
        normalized = (check.worstValue - minMax.min) / (minMax.max - minMax.min);
      } else {
        // plus petit = meilleur
        normalized = (minMax.max - check.worstValue) / (minMax.max - minMax.min);
      }

      // clamp sécurité
      normalized = Math.max(0, Math.min(1, normalized));

      // projection dans [0.5 ; 1]
      check.score = 0.5 + 0.5 * Math.pow(normalized, 2);

      return check;
    });

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
