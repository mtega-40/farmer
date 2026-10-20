import { Task } from '../models/Task.js';
import { logger } from '../utils/logger.js';
import { logActivity } from '../utils/audit.js';

export const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.params.farmId, req.body);
    logger.info(`Task created: ${task.id}`);
    logActivity(req, 'task', 'create', `Created task: ${task.title}`);
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    logger.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { status, assigned_to } = req.query;
    const tasks = await Task.findByFarm(req.params.farmId, { status, assigned_to });
    res.json(tasks);
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.update(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    logActivity(req, 'task', 'update', `Updated task: ${task.title}`);
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    logger.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeTask = async (req, res) => {
  try {
    const task = await Task.complete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    logActivity(req, 'task', 'complete', `Completed task: ${task.title}`);
    res.json({ message: 'Task completed successfully', task });
  } catch (error) {
    logger.error('Complete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.delete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    logActivity(req, 'task', 'delete', `Deleted task: ${task.title}`);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
