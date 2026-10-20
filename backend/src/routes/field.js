import { Router } from 'express';
import {
  createField,
  getFields,
  updateField,
  deleteField,
} from '../Controllers/fieldController.js';
import { authenticate, requireFarmAccess } from '../utils/auth.js';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireFarmAccess('field:create'), createField);
router.get('/', authenticate, requireFarmAccess('field:read'), getFields);
router.put('/:id', authenticate, requireFarmAccess('field:update'), updateField);
router.delete('/:id', authenticate, requireFarmAccess('field:delete'), deleteField);

export default router;
