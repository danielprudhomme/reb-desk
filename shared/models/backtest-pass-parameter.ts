export interface FixedParameter {
  name: string;
  value: number;
}

export interface BacktestPassParameter {
  name: string;
  value: number;
}

export interface GroupedBacktestPassParameter {
  name: string;
  values: number[];
}
