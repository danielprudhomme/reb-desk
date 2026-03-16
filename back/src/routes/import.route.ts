import { Router } from 'express';
import { importReports } from 'src/controllers/import.controller.ts';

export const importRouter = Router();

importRouter.post('/import', importReports);
