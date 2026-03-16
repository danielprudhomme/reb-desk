import { Request, Response } from 'express';
import { runImport } from 'src/services/import.service.ts';

export async function importReports(req: Request, res: Response) {
  try {
    const results = await runImport();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Import failed', detail: String(err) });
  }
}
