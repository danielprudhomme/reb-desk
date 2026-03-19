import { Router } from 'express';
import { analyzeReport, importReports, rebuildReports } from 'src/controllers/report.controller.ts';

export const reportRouter = Router();

reportRouter.post('/import', importReports);
reportRouter.post('/rebuild', rebuildReports);
reportRouter.get('/:reportId/analyze', analyzeReport);
