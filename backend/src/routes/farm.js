import { Router } from 'express';
import {
  createFarm,
  getFarms,
  getFarm,
  updateFarm,
  deleteFarm,
} from '../Controllers/farmController.js';
import { authenticate, requirePermission } from '../utils/auth.js';

const router = Router();

router.post('/', authenticate, requirePermission('farm', 'create'), createFarm);
router.get('/', authenticate, requirePermission('farm', 'read'), getFarms);
router.get('/:id', authenticate, requirePermission('farm', 'read'), getFarm);
router.put('/:id', authenticate, requirePermission('farm', 'update'), updateFarm);
router.delete('/:id', authenticate, requirePermission('farm', 'delete'), deleteFarm);

export default router;
