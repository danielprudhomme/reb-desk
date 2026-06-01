import { Router } from 'express';
import { importReports } from '../controllers/report.controller.ts';

export const reportRouter = Router();

reportRouter.post('/import', importReports);
// reportRouter.post('/rebuild', rebuildReports);
