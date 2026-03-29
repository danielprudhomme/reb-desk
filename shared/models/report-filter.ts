import { ExpertAdvisor } from './expert-advisor';

export interface ReportFilter {
  reportId?: string;
  expert?: ExpertAdvisor;
  symbol?: string;
  timeframe?: string;
}
