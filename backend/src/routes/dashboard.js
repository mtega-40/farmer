import { Router } from 'express';
import {
  getDashboardSummary,
  getFarmBreakdown,
  getMonthlyTrend,
} from '../Controllers/dashboardController.js';
import { authenticate } from '../utils/auth.js';

const router = Router();

router.get('/summary', authenticate, getDashboardSummary);
router.get('/farms', authenticate, getFarmBreakdown);
router.get('/trend', authenticate, getMonthlyTrend);

export default router;
