import { Field } from '../models/Field.js';
import { logger } from '../utils/logger.js';
import { logActivity } from '../utils/audit.js';

export const createField = async (req, res) => {
  try {
    const field = await Field.create(req.params.farmId, req.body);
    logger.info(`Field created: ${field.id} in farm ${req.params.farmId}`);
    logActivity(req, 'field', 'create', `Created field: ${field.name}`);
    res.status(201).json({ message: 'Field created successfully', field });
  } catch (error) {
    logger.error('Create field error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFields = async (req, res) => {
  try {
    const fields = await Field.findByFarm(req.params.farmId);
    res.json(fields);
  } catch (error) {
    logger.error('Get fields error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateField = async (req, res) => {
  try {
    const field = await Field.update(req.params.id, req.body);
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }
    logActivity(req, 'field', 'update', `Updated field: ${field.name}`);
    res.json({ message: 'Field updated successfully', field });
  } catch (error) {
    logger.error('Update field error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteField = async (req, res) => {
  try {
    const field = await Field.delete(req.params.id);
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }
    logActivity(req, 'field', 'delete', `Deleted field: ${field.name}`);
    res.json({ message: 'Field deleted successfully' });
  } catch (error) {
    logger.error('Delete field error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
