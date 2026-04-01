import { ExpertAdvisor } from './expert-advisor';
import { Symbol } from './symbol';
import { Timeframe } from './timeframe';

export interface ReportFilter {
  reportId?: string;
  experts: ExpertAdvisor[];
  symbols: Symbol[];
  timeframes: Timeframe[];
}
