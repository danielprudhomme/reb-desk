import { Router } from 'express';
import { analyze } from '../controllers/analysis.controller.ts';

export const analysisRouter = Router();

analysisRouter.post('', analyze);
