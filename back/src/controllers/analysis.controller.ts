import { Request, Response } from 'express';
import { runAnalysis } from 'src/services/analysis.service.ts';

export async function analyze(req: Request, res: Response) {
  const { reportId } = req.body;

  if (!reportId) {
    return res.status(400).json({ error: 'reportId is required' });
  }

  try {
    const result = await runAnalysis(reportId as string);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Rebuild failed', detail: String(err) });
  }
}
