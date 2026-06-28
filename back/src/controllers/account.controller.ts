import { accountService } from '@src/services/account/account.service.ts';
import { Request, Response } from 'express';

export const createRebReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId } = req.body as { accountId: string };
    res.json(await accountService.createRebReports(accountId));
  } catch (error) {
    res.status(500).json({ error: `Failed to generate REB files: ${error}` });
  }
};

export const syncRebReportsToRobots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId, folderPath } = req.body as { accountId: string; folderPath: string };
    res.json(await accountService.syncRebReportsToRobots(accountId, folderPath));
  } catch (error) {
    res.status(500).json({ error: `Failed to import REB reports: ${error}` });
  }
};

export const generateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId } = req.body as { accountId: string };
    res.json(await accountService.generateProfile(accountId));
  } catch (error) {
    res.status(500).json({ error: `Failed to generate profiles: ${error}` });
  }
};
