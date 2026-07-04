import { AnalysisRequest } from '@shared/models/analysis-request.ts';
import { backtestService } from '../backtest.service.ts';
import { groupBacktests } from './group-backtests.ts';
import { runChecks } from './run-check.ts';
import { computeScore } from './compute-score.ts';
import { AnalyzedGroupedBacktest } from '@shared/models/backtest.ts';

export async function runAnalysis(request: AnalysisRequest): Promise<AnalyzedGroupedBacktest[]> {
  const backtests = await backtestService.getBacktests(request);

  const groupedBacktests = groupBacktests(backtests, 0.1);

  const valuesByType: { worstValues: number[]; min: number; max: number }[] = [];
  const analyzedGroupedPasses = runChecks(
    groupedBacktests,
    backtests[0]?.capital || 0,
    request.thresholds,
    valuesByType,
  );

  computeScore(analyzedGroupedPasses, request.thresholds, valuesByType);

  return analyzedGroupedPasses;
}
