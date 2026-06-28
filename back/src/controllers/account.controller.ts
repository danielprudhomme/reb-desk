import { accountService } from '@src/services/account/account.service.ts';
import { Request, Response } from 'express';

export const createRebReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId } = req.params as { accountId: string };
    res.json(await accountService.createRebReports(accountId as string));
  } catch (error) {
    res.status(500).json({
      error: `Failed to create REB reports: ${error}`,
    });
  }
};

export const syncRebReportsToRobots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId } = req.params as { accountId: string };
    const { folderPath } = req.body as { folderPath: string };
    res.json(await accountService.syncRebReportsToRobots(accountId, folderPath));
  } catch (error) {
    res.status(500).json({ error: `Failed to import REB reports: ${error}` });
  }
};

export const generateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId } = req.params as { accountId: string };
    res.json(await accountService.generateProfile(accountId));
  } catch (error) {
    res.status(500).json({ error: `Failed to generate profiles: ${error}` });
  }
};
