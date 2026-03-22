import { Router } from 'express';
import { analyze } from 'src/controllers/analysis.controller.ts';

export const analysisRouter = Router();

analysisRouter.post('', analyze);
