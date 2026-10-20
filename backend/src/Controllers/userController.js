import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

export const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const users = await User.findAll({ role, search });
    res.json(users);
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findByIdWithStats(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    if (Number(req.params.id) === Number(req.user.id)) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }
    const user = await User.updateRole(req.params.id, role);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info(`Role updated for user ${req.params.id} to ${role} by admin ${req.user.id}`);
    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    logger.error('Update role error:', error);
    if (error.message === 'Invalid role') {
      return res.status(400).json({ error: 'Invalid role' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (Number(req.params.id) === Number(req.user.id)) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const user = await User.delete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info(`User deleted: ${user.email} by admin ${req.user.id}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const stats = await User.getSystemStats();
    res.json(stats);
  } catch (error) {
    logger.error('Get system stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
