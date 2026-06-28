import {
  createRebReports,
  generateProfile,
  syncRebReportsToRobots,
} from '@src/controllers/account.controller.ts';
import { Router } from 'express';

const router = Router();

router.post('/createRebReports', createRebReports);
router.post('/importRebReportsToRobots', syncRebReportsToRobots);
router.post('/profile', generateProfile);

export default router;
