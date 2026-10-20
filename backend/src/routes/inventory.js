import { Router } from 'express';
import {
  createItem,
  getItems,
  getLowStock,
  updateItem,
  deleteItem,
} from '../Controllers/inventoryController.js';
import { authenticate, requireFarmAccess } from '../utils/auth.js';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireFarmAccess('inventory:create'), createItem);
router.get('/', authenticate, requireFarmAccess('inventory:read'), getItems);
router.get('/low-stock', authenticate, requireFarmAccess('inventory:read'), getLowStock);
router.put('/:id', authenticate, requireFarmAccess('inventory:update'), updateItem);
router.delete('/:id', authenticate, requireFarmAccess('inventory:delete'), deleteItem);

export default router;
