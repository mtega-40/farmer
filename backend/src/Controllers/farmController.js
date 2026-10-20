import { Farm } from '../models/Farm.js';
import { logger } from '../utils/logger.js';
import { logActivity } from '../utils/audit.js';

const logAction = (req, action, details, farmId) =>
  logActivity(req, 'farm', action, details, farmId);

export const createFarm = async (req, res) => {
  try {
    const farm = await Farm.create(req.user.id, req.body);
    logger.info(`Farm created: ${farm.name} by user ${req.user.id}`);
    logAction(req, 'create', `Created farm: ${farm.name}`, farm.id);
    res.status(201).json({ message: 'Farm created successfully', farm });
  } catch (error) {
    logger.error('Create farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFarms = async (req, res) => {
  try {
    const farms = await Farm.findAll(req.user.id, req.user.role);
    res.json(farms);
  } catch (error) {
    logger.error('Get farms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFarm = async (req, res) => {
  try {
    const farm = await Farm.findByIdForUser(req.params.id, req.user.id, req.user.role);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    res.json(farm);
  } catch (error) {
    logger.error('Get farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFarm = async (req, res) => {
  try {
    const existing = await Farm.findByIdForUser(req.params.id, req.user.id, req.user.role);
    if (!existing) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    const farm = await Farm.update(req.params.id, req.body);
    logAction(req, 'update', `Updated farm: ${farm.name}`, farm.id);
    res.json({ message: 'Farm updated successfully', farm });
  } catch (error) {
    logger.error('Update farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFarm = async (req, res) => {
  try {
    const existing = await Farm.findByIdForUser(req.params.id, req.user.id, req.user.role);
    if (!existing) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    await Farm.delete(req.params.id);
    logger.info(`Farm deleted: ${req.params.id}`);
    res.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    logger.error('Delete farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
