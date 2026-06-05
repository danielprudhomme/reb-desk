import { BacktestThreshold } from './backtest-threshold';

export interface AnalysisRequest {
  reportId?: string;
  strategyContextId?: string;
  thresholds: BacktestThreshold[];
}
