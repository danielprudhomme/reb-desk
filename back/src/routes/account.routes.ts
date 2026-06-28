import {
  createRebReports,
  generateProfile,
  syncRebReportsToRobots,
} from '@src/controllers/account.controller.ts';
import { Router } from 'express';

const router = Router();

router.post('/:accountId/reb-reports', createRebReports);
router.post('/:accountId/reb-reports/sync', syncRebReportsToRobots);
router.post('/:accountId/profile', generateProfile);

export default router;
