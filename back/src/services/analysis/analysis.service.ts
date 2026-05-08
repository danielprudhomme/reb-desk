import { BacktestThreshold } from '@shared/models/backtest-threshold.ts';
import { GroupedBacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.ts';
import { collections } from '../../db/collections.ts';
import { ReportFilter } from '@shared/models/report-filter.ts';
import { parseRebPass } from '../parser/reb-report.parser.ts';
import { runChecks } from './run-check.ts';
import { computeScore } from './compute-score.ts';
import { ValuesByThresholdType } from './models/values-by-thresold-type.ts';
import { BacktestPass } from '@shared/models/backtest-pass.ts';
import { groupPasses } from './group-passes.ts';
import { ExpertAdvisor } from '@shared/models/expert-advisor.ts';
import { TimeUnit } from '@shared/models/time-unit.ts';
import { RebReport } from '@sec/db/models/reb-report.ts';
import { GroupedReportAnalysis } from '@shared/models/grouped-report-analysis.ts';

interface GroupedReport {
  context: {
    expert: ExpertAdvisor;
    symbol: string;
    timeframe: string;
    capital: number;
    startDate: string;
    shortTermCount: number;
    shortTermDuration: number;
    shortTermUnit: TimeUnit;
    longTermDuration: number;
    longTermUnit: TimeUnit;
  };
  reports: RebReport[];
  passes: BacktestPass[];
  groupedPasses: GroupedBacktestPassAnalysis[];
}

export async function runAnalysis(filter: ReportFilter): Promise<GroupedReportAnalysis[]> {
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
async function analyzeReports(query: any): Promise<GroupedReportAnalysis[]> {
  const reports = collections.RebReport().find(query);

  if (!reports.length) {
    throw new Error('No reports found for given filters');
  }

  const valuesByType: ValuesByThresholdType = {} as ValuesByThresholdType;
  const grouped = new Map<string, GroupedReport>();

  for (const report of reports) {
    const passes: BacktestPass[] = (await parseRebPass(report.path)).map((pass) => ({
      ...pass,
      reportId: report.id,
    }));

    const key = buildContextKey(report);
    if (!grouped.has(key)) {
      grouped.set(key, {
        context: report,
        reports: [],
        passes: [],
        groupedPasses: [],
      });
    }

    const group = grouped.get(key)!;

    group.reports.push(report);
    group.passes.push(...passes);
  }

  for (const group of grouped.values()) {
    const groupedPasses = groupPasses(group.passes, 0.1);
    const analyzedGroupedPasses = runChecks(
      groupedPasses,
      group.context.capital,
      thresholds,
      valuesByType,
    );
    computeScore(analyzedGroupedPasses, thresholds, valuesByType);
    group.groupedPasses = analyzedGroupedPasses;
  }

  return Array.from(grouped.values()).map((group) => ({
    expert: group.context.expert,
    symbol: group.context.symbol,
    timeframe: group.context.timeframe,
    capital: group.context.capital,
    startDate: group.context.startDate,
    shortTermCount: group.context.shortTermCount,
    shortTermDuration: group.context.shortTermDuration,
    shortTermUnit: group.context.shortTermUnit,
    longTermDuration: group.context.longTermDuration,
    longTermUnit: group.context.longTermUnit,
    passes: group.groupedPasses,
  }));
}

function buildContextKey(report: RebReport): string {
  return [
    report.expert,
    report.symbol,
    report.timeframe,
    report.capital,
    report.startDate,
    report.shortTermCount,
    report.shortTermDuration,
    report.shortTermUnit,
    report.longTermDuration,
    report.longTermUnit,
  ].join('|');
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
    type: 'shortTermDrawdownPercent',
    operator: '<',
    value: 30,
    passRate: 100,
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
