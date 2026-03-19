import { RebParameter } from './reb-parameter.ts';

export type ParsedRebParameter = Omit<RebParameter, 'id' | 'reportId'>;
