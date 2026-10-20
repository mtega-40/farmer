import { Worker } from '../models/Worker.js';
import { logger } from '../utils/logger.js';
import { logActivity } from '../utils/audit.js';

export const createWorker = async (req, res) => {
  try {
    const worker = await Worker.create(req.params.farmId, req.body.user_id, req.body);
    logger.info(`Worker created: ${worker.id}`);
    logActivity(req, 'worker', 'create', `Added worker record #${worker.id}`);
    res.status(201).json({ message: 'Worker created successfully', worker });
  } catch (error) {
    logger.error('Create worker error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWorkers = async (req, res) => {
  try {
    const workers = await Worker.findByFarm(req.params.farmId);
    res.json(workers);
  } catch (error) {
    logger.error('Get workers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.update(req.params.id, req.body);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    logActivity(req, 'worker', 'update', `Updated worker record #${worker.id}`);
    res.json({ message: 'Worker updated successfully', worker });
  } catch (error) {
    logger.error('Update worker error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.delete(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    logActivity(req, 'worker', 'delete', `Removed worker record #${worker.id}`);
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    logger.error('Delete worker error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
