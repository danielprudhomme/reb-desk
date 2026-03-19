import { RebReport } from '../db/models/reb-report.ts';

export type ParsedRebReport = Omit<RebReport, 'id' | 'fingerprint'>;
