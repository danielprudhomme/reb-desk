import { Parameter } from '@shared/models/parameter.ts';

export interface ParameterSet {
  id: string;
  strategyContextId: string;
  parameters: Parameter[];
  fingerprint: string;
}
