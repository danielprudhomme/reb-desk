import { ReportFilter } from './report-filter';
import { BacktestThreshold } from './backtest-threshold';

export interface AnalysisRequest extends ReportFilter {
  thresholds: BacktestThreshold[];
}
