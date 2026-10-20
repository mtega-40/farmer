import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  completeTask,
  deleteTask,
} from '../Controllers/taskController.js';
import { authenticate, requireFarmAccess } from '../utils/auth.js';

const router = Router({ mergeParams: true });

router.post('/', authenticate, requireFarmAccess('task:create'), createTask);
router.get('/', authenticate, requireFarmAccess('task:read'), getTasks);
router.put('/:id', authenticate, requireFarmAccess('task:update'), updateTask);
router.post('/:id/complete', authenticate, requireFarmAccess('task:update'), completeTask);
router.delete('/:id', authenticate, requireFarmAccess('task:delete'), deleteTask);

export default router;
