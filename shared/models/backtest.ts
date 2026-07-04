import { GroupedParameterSet, ParameterSet } from './parameter-set';
import { BacktestResult } from './backtest-result';
import { BacktestThresholdCheck } from './backtest-threshold-check';
import { TimeUnit } from './time-unit';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol } from '@shared/models/symbol';

export interface Backtest {
  reportId: string;
  id: string;
  parameterSetId: string;
  passNumber: number;
  parameterSet: ParameterSet;
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  leverage: number;
  capital: number;
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
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  leverage: number;
  capital: number;
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
