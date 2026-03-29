import { ExpertAdvisor } from './expert-advisor';

export interface ReportFilter {
  expert?: ExpertAdvisor;
  symbol?: string;
  timeframe?: string;
}
