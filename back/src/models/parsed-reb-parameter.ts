import { RebParameter } from '../db/models/reb-parameter.ts';

export type ParsedRebParameter = Omit<RebParameter, 'id' | 'reportId'>;
