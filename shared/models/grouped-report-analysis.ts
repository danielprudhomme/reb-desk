import { ExpertAdvisor } from './expert-advisor';
import { Symbol } from './symbol';
import { TimeUnit } from './time-unit';
import { GroupedBacktestPassAnalysis } from './backtest-pass-analysis';
import { Timeframe } from './timeframe';

export interface GroupedReportAnalysis {
  expert: ExpertAdvisor;
  symbol: Symbol;
  timeframe: Timeframe;
  capital: number;
  startDate: string;
  shortTermCount: number;
  shortTermDuration: number;
  shortTermUnit: TimeUnit;
  longTermDuration: number;
  longTermUnit: TimeUnit;
  passes: GroupedBacktestPassAnalysis[];
}
