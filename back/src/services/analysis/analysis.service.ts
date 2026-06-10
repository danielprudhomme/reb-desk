import { AnalysisRequest } from '@shared/models/analysis-request.ts';
import { backtestService } from '../backtest.service.ts';
import { groupBacktests } from './group-backtests.ts';
import { runChecks } from './run-check.ts';
import { ValuesByThresholdType } from './models/values-by-thresold-type.ts';
import { computeScore } from './compute-score.ts';
import { AnalyzedGroupedBacktest } from '@shared/models/backtest.ts';

export async function runAnalysis(request: AnalysisRequest): Promise<AnalyzedGroupedBacktest[]> {
  const backtests = await backtestService.getBacktests(request);

  const groupedBacktests = groupBacktests(backtests, 0.1);

  const valuesByType: ValuesByThresholdType = {} as ValuesByThresholdType;
  const analyzedGroupedPasses = runChecks(
    groupedBacktests,
    backtests[0]?.strategyContext.capital || 0,
    request.thresholds,
    valuesByType,
  );

  computeScore(analyzedGroupedPasses, request.thresholds, valuesByType);

  return analyzedGroupedPasses;
}
