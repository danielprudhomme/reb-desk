import { AnalysisRequest } from '@shared/models/analysis-request.ts';
import { runAnalysis } from '@src/services/analysis/analysis.service.ts';
import { Request, Response } from 'express';

export async function analyze(req: Request, res: Response) {
  try {
    res.json(await runAnalysis(req.body as AnalysisRequest));
  } catch (err) {
    res.status(500).json({ error: 'Rebuild failed', detail: String(err) });
  }
}
