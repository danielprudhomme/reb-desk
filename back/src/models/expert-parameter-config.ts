import { ExpertParameterName } from '@shared/models/expert-parameter-name.ts';

export interface ExpertParameterConfig {
  name: ExpertParameterName;
  value: number;
  variable: boolean;
  min: number;
  max: number;
  step: number;
}
