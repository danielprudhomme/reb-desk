import { Request, Response } from 'express';
import { runSync } from 'src/services/sync.service.ts';

export async function syncReports(req: Request, res: Response) {
  try {
    const results = await runSync();
    res.json(results);
  } catch (err) {
    res.status(500).json({
      error: 'Sync failed',
      detail: String(err),
    });
  }
}
