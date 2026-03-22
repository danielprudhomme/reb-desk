import { Request, Response } from 'express';
import { runAnalysis, runAnalysisForReports } from 'src/services/analysis.service.ts';

export async function analyze(req: Request, res: Response) {
  const { reportId, symbol, timeframe } = req.body;

  let result;
  try {
    if (reportId) {
      result = await runAnalysis(reportId as string);
    } else if (symbol || timeframe) {
      result = await runAnalysisForReports({ symbol, timeframe });
    } else {
      return res.status(400).json({ error: 'filters parameters are not good' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Rebuild failed', detail: String(err) });
  }
}
