import { BacktestThresholdType } from './backtest-threshold-type';

export interface BacktestThreshold {
  type: BacktestThresholdType;
  operator: '>' | '<';
  value: number;
  passRate: number; // % des passages qui doivent respecter le critère
}
