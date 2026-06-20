import { generateRebFilesForAccount } from '@src/services/reb-report-generator/generate-reb-files.service.ts';
import { Request, Response } from 'express';

export async function generateRebFiles(req: Request, res: Response) {
  try {
    const { accountId } = req.body as { accountId: string };
    res.json(await generateRebFilesForAccount(accountId));
  } catch (err) {
    res.status(500).json({ error: 'Generate REB files failed', detail: String(err) });
  }
}
