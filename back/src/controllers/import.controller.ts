import { Request, Response } from 'express';
import { runImport } from 'src/services/import.service.ts';

export async function importReports(req: Request, res: Response) {
  const { folderPath } = req.body;

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
