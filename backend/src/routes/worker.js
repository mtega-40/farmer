import { Router } from 'express';
import {
  createWorker,
  getWorkers,
  updateWorker,
  deleteWorker,
} from '../Controllers/workerController.js';
import { authenticate, requireFarmAccess } from '../utils/auth.js';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireFarmAccess('worker:create'), createWorker);
router.get('/', authenticate, requireFarmAccess('worker:read'), getWorkers);
router.put('/:id', authenticate, requireFarmAccess('worker:update'), updateWorker);
router.delete('/:id', authenticate, requireFarmAccess('worker:delete'), deleteWorker);

export default router;
