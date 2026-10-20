import { Diary } from '../models/Diary.js';
import { logger } from '../utils/logger.js';
import { logActivity } from '../utils/audit.js';

export const createEntry = async (req, res) => {
  try {
    const entry = await Diary.create(req.params.farmId, req.user.id, req.body);
    logger.info(`Diary entry created: ${entry.id}`);
    logActivity(req, 'diary', 'create', `Added diary entry: ${entry.title}`);
    res.status(201).json({ message: 'Diary entry created successfully', entry });
  } catch (error) {
    logger.error('Create diary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEntries = async (req, res) => {
  try {
    const { category, start_date, end_date, limit } = req.query;
    const entries = await Diary.findByFarm(req.params.farmId, {
      category,
      start_date,
      end_date,
      limit: limit ? parseInt(limit) : 50,
    });
    res.json(entries);
  } catch (error) {
    logger.error('Get diary entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const entry = await Diary.update(req.params.id, req.params.farmId, req.body);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    logActivity(req, 'diary', 'update', `Updated diary entry: ${entry.title}`);
    res.json({ message: 'Entry updated successfully', entry });
  } catch (error) {
    logger.error('Update diary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const entry = await Diary.delete(req.params.id, req.params.farmId);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    logActivity(req, 'diary', 'delete', `Deleted diary entry: ${entry.title}`);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    logger.error('Delete diary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
