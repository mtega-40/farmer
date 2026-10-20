import jwt from 'jsonwebtoken';
import pool from '../database/config.js';
import { isAdmin, can, ROLES, ALL_ROLES, ROLE_PERMISSIONS } from './roles.js';

export { isAdmin, can, ROLES, ALL_ROLES, ROLE_PERMISSIONS };

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const result = await pool.query(
      'SELECT id, name, email, role, phone FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

export const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!can(req.user, resource, action)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
};

const FARM_ACCESS_SQL = `
  SELECT f.id FROM farms f
  LEFT JOIN workers w ON w.farm_id = f.id AND w.user_id = $1
  WHERE f.owner_id = $1 OR w.user_id = $1
`;

export const userFarmIds = async (user) => {
  if (isAdmin(user)) {
    const result = await pool.query('SELECT id FROM farms');
    return result.rows.map((r) => r.id);
  }
  const result = await pool.query(FARM_ACCESS_SQL, [user.id]);
  return [...new Set(result.rows.map((r) => r.id))];
};

export const canAccessFarm = async (user, farmId) => {
  if (isAdmin(user)) return true;
  const result = await pool.query(`${FARM_ACCESS_SQL} AND f.id = $2`, [user.id, farmId]);
  return result.rows.length > 0;
};

export const requireFarmAccess = (permission) => {
  return async (req, res, next) => {
    try {
      const farmId = req.params.farmId;
      if (!farmId) {
        return res.status(400).json({ error: 'Farm id is required' });
      }
      if (permission) {
        const [resource, action] = permission.split(':');
        if (!can(req.user, resource, action)) {
          return res.status(403).json({ error: 'You do not have permission to perform this action' });
        }
      }
      const allowed = await canAccessFarm(req.user, farmId);
      if (!allowed) {
        return res.status(403).json({ error: 'You do not have access to this farm' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const requireSessionOwner = async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId || req.body.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session id is required' });
    }
    if (isAdmin(req.user)) {
      return next();
    }
    const result = await pool.query(
      'SELECT id FROM ai_chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You can only access your own chat sessions' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
