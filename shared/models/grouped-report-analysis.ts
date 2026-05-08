import { ExpertAdvisor } from './expert-advisor';
import { TimeUnit } from './time-unit';
import { GroupedBacktestPassAnalysis } from './backtest-pass-analysis';

export interface GroupedReportAnalysis {
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
  passes: GroupedBacktestPassAnalysis[];
}
