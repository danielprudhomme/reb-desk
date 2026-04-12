import { ReportFilter } from '@shared/models/report-filter.ts';
import { Request, Response } from 'express';
import { runAnalysis } from '../services/analysis.service.ts';

export async function analyze(req: Request, res: Response) {
  try {
    res.json(await runAnalysis(req.body as ReportFilter));
  } catch (err) {
    res.status(500).json({ error: 'Rebuild failed', detail: String(err) });
  }
}
