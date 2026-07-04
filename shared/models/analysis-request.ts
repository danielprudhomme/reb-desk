import { BacktestThreshold } from './backtest-threshold';
import { ExpertAdvisor } from './expert-advisor';
import { Symbol } from './symbol';
import { Timeframe } from './timeframe';

export interface AnalysisRequest {
  reportId?: string;
  strategyContext?: {
    expert: ExpertAdvisor;
    symbol: Symbol;
    timeframe: Timeframe;
    leverage: number;
    capital: number;
  };
  thresholds: BacktestThreshold[];
}
