import { Request, Response } from 'express';
import { runAnalysis } from 'src/services/analysis.service.ts';
import { runRebuild, runImport } from 'src/services/import.service.ts';

export async function importReports(req: Request, res: Response) {
  const { folderPath } = req.body as { folderPath: string };

  if (!folderPath) {
    return res.status(400).json({ error: 'folderPath is required' });
  }

  try {
    const result = await runImport(folderPath);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Import failed', detail: String(err) });
  }
}

export async function rebuildReports(req: Request, res: Response) {
  try {
    const result = await runRebuild();

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Rebuild failed', detail: String(err) });
  }
}

export async function analyzeReport(req: Request, res: Response) {
  const { reportId } = req.params;

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
