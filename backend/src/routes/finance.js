import { Router } from 'express';
import {
  createExpense,
  createIncome,
  getExpenses,
  getIncome,
  getSummary,
} from '../Controllers/financeController.js';
import { authenticate, requireFarmAccess } from '../utils/auth.js';

const router = Router({ mergeParams: true });

router.post('/expense', authenticate, requireFarmAccess('finance:create'), createExpense);
router.post('/income', authenticate, requireFarmAccess('finance:create'), createIncome);
router.get('/expenses', authenticate, requireFarmAccess('finance:read'), getExpenses);
router.get('/income', authenticate, requireFarmAccess('finance:read'), getIncome);
router.get('/summary', authenticate, requireFarmAccess('finance:read'), getSummary);

export default router;
