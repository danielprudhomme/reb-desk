import { Router } from 'express';
import { syncReports } from 'src/controllers/sync.controller.ts';

export const syncRouter = Router();

syncRouter.get('/sync', syncReports);
