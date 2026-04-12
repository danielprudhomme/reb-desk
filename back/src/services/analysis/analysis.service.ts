import { BacktestThreshold } from '@shared/models/backtest-threshold.ts';
import { BacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.ts';
import { collections } from '../../db/collections.ts';
import { ReportFilter } from '@shared/models/report-filter.ts';
import { parseRebPass } from '../parser/reb-report.parser.ts';
import { BacktestThresholdType } from '@shared/models/backtest-threshold-type.ts';
import { runChecks } from './run-check.ts';
import { computeScore } from './compute-score.ts';

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

  return await analyzeReports(query);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function analyzeReports(query: any): Promise<BacktestPassAnalysis[]> {
  const reports = collections.RebReport().find(query);

  if (!reports.length) {
    throw new Error('No reports found for given filters');
  }
  const analyzedPasses: BacktestPassAnalysis[] = [];
  const valuesByType: Record<
    BacktestThresholdType,
    { worstValues: number[]; min: number; max: number }
  > = {} as Record<BacktestThresholdType, { worstValues: number[]; min: number; max: number }>;

  for (const report of reports) {
    const passes = await parseRebPass(report.path);
    analyzedPasses.push(...runChecks(report, passes, thresholds, valuesByType));
  }

  computeScore(analyzedPasses, thresholds, valuesByType);

  return analyzedPasses;
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
