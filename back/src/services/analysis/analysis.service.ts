import { BacktestThreshold } from '@shared/models/backtest-threshold.ts';
import { GroupedBacktestPassAnalysis } from '@shared/models/backtest-pass-analysis.ts';
import { collections } from '../../db/collections.ts';
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
import { AnalysisRequest } from '@shared/models/analysis-request.ts';
import { Capital } from '@shared/models/capital.ts';

interface GroupedReport {
  context: {
    expert: ExpertAdvisor;
    symbol: string;
    timeframe: string;
    capital: Capital;
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

export async function runAnalysis(request: AnalysisRequest): Promise<GroupedReportAnalysis[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (request.reportId) {
    query.id = request.reportId;
  } else {
    if (request.experts?.length) {
      query.expert = { $in: request.experts };
    }

    if (request.symbols?.length) {
      query.symbol = { $in: request.symbols };
    }

    if (request.timeframes?.length) {
      query.timeframe = { $in: request.timeframes };
    }

    if (request.capital) {
      query.capital = { $eq: request.capital };
    }
  }

  return await analyzeReports(query, request.thresholds);
}

async function analyzeReports(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  thresholds: BacktestThreshold[],
): Promise<GroupedReportAnalysis[]> {
  const reports = collections.RebReport().find(query);

  if (!reports.length) {
    return [];
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
