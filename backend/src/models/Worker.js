import pool from '../database/config.js';

const ALLOWED_WORKER_COLUMNS = ['user_id', 'position', 'salary', 'hire_date', 'status', 'farm_id'];

export class Worker {
  static async create(farmId, userId, data) {
    const { position, salary, hire_date } = data;
    const result = await pool.query(
      `INSERT INTO workers (farm_id, user_id, position, salary, hire_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [farmId, userId, position || null, salary || null, hire_date || null]
    );
    return result.rows[0];
  }

  static async findByFarm(farmId) {
    const result = await pool.query(
      `SELECT w.*, u.name, u.email, u.phone 
       FROM workers w 
       JOIN users u ON u.id = w.user_id 
       WHERE w.farm_id = $1 
       ORDER BY w.created_at DESC`,
      [farmId]
    );
    return result.rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    for (const key of Object.keys(data)) {
      if (!ALLOWED_WORKER_COLUMNS.includes(key)) continue;
      fields.push(`${key} = $${paramCount++}`);
      values.push(data[key] || null);
    }
    values.push(id);
    const query = `UPDATE workers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM workers WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}