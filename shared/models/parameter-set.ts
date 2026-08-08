import { Backtest } from './backtest';
import { BacktestResult } from './backtest-result';
import { GroupedParameter, Parameter } from './parameter';
import { TimeUnit } from './time-unit';

export interface ParameterSet {
  id: string;
  parameters: Parameter[];
  backtests: {
    id: string;
    reportId: string;
    passNumber: number;
    shortTermCount: number;
    shortTermUnit: TimeUnit;
    shortTermDuration: number;
    longTermUnit: TimeUnit;
    longTermDuration: number;
    shortTermResults: BacktestResult[];
    longTermResults: BacktestResult[];
  }[];
}

export interface GroupedParameterSet {
  id: string;
  parameters: GroupedParameter[];
}
