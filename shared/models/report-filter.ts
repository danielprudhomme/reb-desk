import { ExpertAdvisor } from './expert-advisor';
import { Symbol } from './symbol';
import { Timeframe } from './timeframe';
import { Capital } from './capital';

export interface ReportFilter {
  reportId?: string;
  experts: ExpertAdvisor[];
  symbols: Symbol[];
  timeframes: Timeframe[];
  capital: Capital | null;
}
