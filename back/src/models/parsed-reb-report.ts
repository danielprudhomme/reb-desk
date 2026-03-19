import { RebReport } from './reb-report.ts';

export type ParsedRebReport = Omit<RebReport, 'id' | 'fingerprint'>;
