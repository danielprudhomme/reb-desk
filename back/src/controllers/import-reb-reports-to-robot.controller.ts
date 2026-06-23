import { robotService } from '@src/services/robot.service.ts';
import { Request, Response } from 'express';

export async function importRebReportsToRobots(req: Request, res: Response) {
  try {
    const { accountId, folderPath } = req.body as { accountId: string; folderPath: string };
    res.json(await robotService.importRebReports(accountId, folderPath));
  } catch (err) {
    res.status(500).json({ error: 'Import REB reports to robots', detail: String(err) });
  }
}
