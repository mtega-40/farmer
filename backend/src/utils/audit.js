import { ActivityLog } from '../models/ActivityLog.js';
import { logger } from './logger.js';

export const logActivity = (req, module, action, details, farmId) => {
  const targetFarmId = farmId || req.params.farmId;
  if (!targetFarmId || !req.user) return;
  ActivityLog.create(targetFarmId, req.user.id, action, details, module).catch((error) =>
    logger.error('Activity log error:', error.message)
  );
};
