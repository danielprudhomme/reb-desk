import { ExpertParameterName } from './expert-parameter-name';

export interface Parameter {
  name: ExpertParameterName;
  value: number;
}

export interface GroupedParameter {
  name: ExpertParameterName;
  values: number[];
}
