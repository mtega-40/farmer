import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getSystemStats,
} from '../Controllers/userController.js';
import { authenticate, authorize, ROLES } from '../utils/auth.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', getUsers);
router.get('/stats', getSystemStats);
router.get('/:id', getUser);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
