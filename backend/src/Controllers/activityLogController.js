import { ActivityLog } from '../models/ActivityLog.js';
import { logger } from '../utils/logger.js';

export const getLogs = async (req, res) => {
  try {
    const { module, action, start_date, end_date, limit } = req.query;
    const logs = await ActivityLog.findByFarm(req.params.farmId, {
      module,
      action,
      start_date,
      end_date,
      limit: limit ? parseInt(limit) : 50,
    });
    res.json(logs);
  } catch (error) {
    logger.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getModules = async (req, res) => {
  try {
    const modules = await ActivityLog.getModules(req.params.farmId);
    res.json(modules);
  } catch (error) {
    logger.error('Get modules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActions = async (req, res) => {
  try {
    const { module } = req.query;
    const actions = await ActivityLog.getActions(req.params.farmId, module);
    res.json(actions);
  } catch (error) {
    logger.error('Get actions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};