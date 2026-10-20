import { Livestock } from '../models/Livestock.js';
import { logger } from '../utils/logger.js';
import { logActivity } from '../utils/audit.js';

export const createLivestock = async (req, res) => {
  try {
    const animal = await Livestock.create(req.params.farmId, req.body);
    logger.info(`Livestock created: ${animal.tag_number}`);
    logActivity(req, 'livestock', 'create', `Added livestock ${animal.species} (${animal.tag_number})`);
    res.status(201).json({ message: 'Livestock created successfully', animal });
  } catch (error) {
    logger.error('Create livestock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLivestock = async (req, res) => {
  try {
    const animals = await Livestock.findByFarm(req.params.farmId);
    res.json(animals);
  } catch (error) {
    logger.error('Get livestock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLivestock = async (req, res) => {
  try {
    const animal = await Livestock.update(req.params.id, req.body);
    if (!animal) {
      return res.status(404).json({ error: 'Livestock not found' });
    }
    logActivity(req, 'livestock', 'update', `Updated livestock ${animal.tag_number}`);
    res.json({ message: 'Livestock updated successfully', animal });
  } catch (error) {
    logger.error('Update livestock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteLivestock = async (req, res) => {
  try {
    const animal = await Livestock.delete(req.params.id);
    if (!animal) {
      return res.status(404).json({ error: 'Livestock not found' });
    }
    logActivity(req, 'livestock', 'delete', `Deleted livestock ${animal.tag_number}`);
    res.json({ message: 'Livestock deleted successfully' });
  } catch (error) {
    logger.error('Delete livestock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
