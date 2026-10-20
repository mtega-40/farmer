import { Router } from 'express';
import {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
} from '../Controllers/diaryController.js';
import { authenticate, requireFarmAccess } from '../utils/auth.js';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireFarmAccess('diary:create'), createEntry);
router.get('/', authenticate, requireFarmAccess('diary:read'), getEntries);
router.put('/:id', authenticate, requireFarmAccess('diary:update'), updateEntry);
router.delete('/:id', authenticate, requireFarmAccess('diary:delete'), deleteEntry);

export default router;
