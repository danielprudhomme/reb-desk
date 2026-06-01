// import { AnalysisRequest } from '@shared/models/analysis-request.ts';
import { Request, Response } from 'express';
// import { runAnalysis } from '../services/analysis/analysis.service.ts';

export async function analyze(req: Request, res: Response) {
  // try {
  //   res.json(await runAnalysis(req.body as AnalysisRequest));
  // } catch (err) {
  //   res.status(500).json({ error: 'Rebuild failed', detail: String(err) });
  // }

  res.status(500).json({ error: 'Rebuild failed', detail: String('lol') });
}
