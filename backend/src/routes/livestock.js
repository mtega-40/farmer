import { Router } from 'express';
import {
  createLivestock,
  getLivestock,
  updateLivestock,
  deleteLivestock,
} from '../Controllers/livestockController.js';
import { authenticate, requireFarmAccess } from '../utils/auth.js';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireFarmAccess('livestock:create'), createLivestock);
router.get('/', authenticate, requireFarmAccess('livestock:read'), getLivestock);
router.put('/:id', authenticate, requireFarmAccess('livestock:update'), updateLivestock);
router.delete('/:id', authenticate, requireFarmAccess('livestock:delete'), deleteLivestock);

export default router;
