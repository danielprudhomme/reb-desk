import { BacktestThresholdType } from './backtest-threshold-type';

export interface BacktestThreshold {
  type: BacktestThresholdType;
  operator: '>' | '<';
  value: number;
  passRate: number; // % des passages qui doivent respecter le critère
  weight?: number;
  /* WEIGHT : 
      3 = critique (risk)
      2 = important (performance)
      1 = normal
      0.5 = secondaire
  */
}
