import { Router } from 'express';
import { importReports, rebuildReports } from '../controllers/report.controller.ts';

export const reportRouter = Router();

reportRouter.post('/import', importReports);
reportRouter.post('/rebuild', rebuildReports);
