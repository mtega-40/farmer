import { Router } from 'express';
import {
  getLogs,
  getModules,
  getActions,
} from '../Controllers/activityLogController.js';
import { authenticate, requireFarmAccess } from '../utils/auth.js';

const router = Router({ mergeParams: true });

router.get('/', authenticate, requireFarmAccess('activityLog:read'), getLogs);
router.get('/modules', authenticate, requireFarmAccess('activityLog:read'), getModules);
router.get('/actions', authenticate, requireFarmAccess('activityLog:read'), getActions);

export default router;
