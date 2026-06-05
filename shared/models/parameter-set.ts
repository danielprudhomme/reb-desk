import { GroupedParameter, Parameter } from './parameter';

export interface ParameterSet {
  id: string;
  parameters: Parameter[];
}

export interface GroupedParameterSet {
  id: string;
  parameters: GroupedParameter[];
}
