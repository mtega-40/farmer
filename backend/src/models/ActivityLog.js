import pool from '../database/config.js';

export class ActivityLog {
  static async create(farmId, userId, action, details, module) {
    const result = await pool.query(
      `INSERT INTO activity_logs (farm_id, user_id, action, details, module) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [farmId, userId, action, details, module]
    );
    return result.rows[0];
  }

  static async findByFarm(farmId, filters = {}) {
    const { module, action, start_date, end_date, limit = 50 } = filters;
    let query = `SELECT a.*, u.name as user_name, u.email as user_email 
                 FROM activity_logs a 
                 JOIN users u ON u.id = a.user_id 
                 WHERE a.farm_id = $1`;
    const values = [farmId];
    let paramCount = 2;

    if (module) {
      query += ` AND a.module = $${paramCount++}`;
      values.push(module);
    }
    if (action) {
      query += ` AND a.action = $${paramCount++}`;
      values.push(action);
    }
    if (start_date) {
      query += ` AND a.created_at >= $${paramCount++}`;
      values.push(start_date);
    }
    if (end_date) {
      query += ` AND a.created_at <= $${paramCount++}`;
      values.push(end_date);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount++}`;
    values.push(limit);

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getModules(farmId) {
    const result = await pool.query(
      'SELECT DISTINCT module FROM activity_logs WHERE farm_id = $1 ORDER BY module',
      [farmId]
    );
    return result.rows.map(r => r.module);
  }

  static async getActions(farmId, module) {
    let query = 'SELECT DISTINCT action FROM activity_logs WHERE farm_id = $1';
    const values = [farmId];
    if (module) {
      query += ' AND module = $2';
      values.push(module);
    }
    query += ' ORDER BY action';
    const result = await pool.query(query, values);
    return result.rows.map(r => r.action);
  }
}