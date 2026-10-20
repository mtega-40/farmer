import { Inventory } from '../models/Inventory.js';
import { logger } from '../utils/logger.js';
import { logActivity } from '../utils/audit.js';

export const createItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.params.farmId, req.body);
    logger.info(`Inventory item created: ${item.id}`);
    logActivity(req, 'inventory', 'create', `Added inventory item: ${item.name}`);
    res.status(201).json({ message: 'Item created successfully', item });
  } catch (error) {
    logger.error('Create inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getItems = async (req, res) => {
  try {
    const items = await Inventory.findByFarm(req.params.farmId);
    res.json(items);
  } catch (error) {
    logger.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const items = await Inventory.getLowStock(req.params.farmId);
    res.json(items);
  } catch (error) {
    logger.error('Get low stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Inventory.update(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    logActivity(req, 'inventory', 'update', `Updated inventory item: ${item.name}`);
    res.json({ message: 'Item updated successfully', item });
  } catch (error) {
    logger.error('Update inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.delete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    logActivity(req, 'inventory', 'delete', `Deleted inventory item: ${item.name}`);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    logger.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
