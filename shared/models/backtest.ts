import { GroupedParameterSet, ParameterSet } from './parameter-set';
import { BacktestResult } from './backtest-result';
import { StrategyContext } from './strategy-context';
import { BacktestThresholdCheck } from './backtest-threshold-check';
import { TimeUnit } from './time-unit';

export interface Backtest {
  reportId: string;
  id: string;
  parameterSetId: string;
  passNumber: number;
  parameterSet: ParameterSet;
  strategyContext: StrategyContext;
  longTermUnit: TimeUnit;
  longTermDuration: number;
  shortTermResults: BacktestResult[];
  longTermResults: BacktestResult[];
}

export interface GroupedBacktest {
  reportIds: string[];
  parameterSetIds: string[];
  passNumbers: number[];
  parameterSets: ParameterSet[];
  groupedParameterSet: GroupedParameterSet;
  strategyContext: StrategyContext;
  longTermUnit: TimeUnit;
  longTermDuration: number;
  shortTermResults: BacktestResult[];
  longTermResults: BacktestResult[];
}

export interface AnalyzedGroupedBacktest extends GroupedBacktest {
  ok: boolean;
  checks: BacktestThresholdCheck[];
  score: number;
}
