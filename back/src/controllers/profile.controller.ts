import { generateProfileForAccount } from '@src/services/reb-report-generator/generate-profile.service.ts';
import { Request, Response } from 'express';

export async function generateProfiles(req: Request, res: Response) {
  try {
    const { accountId } = req.body as { accountId: string };
    res.json(await generateProfileForAccount(accountId));
  } catch (err) {
    res.status(500).json({ error: 'Generate REB files failed', detail: String(err) });
  }
}
