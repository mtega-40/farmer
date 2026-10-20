import pool from '../database/config.js';

export class Diary {
  static async create(farmId, userId, data) {
    const { title, content, category, date } = data;
    const result = await pool.query(
      `INSERT INTO diary (farm_id, user_id, title, content, category, date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [farmId, userId, title, content, category, date]
    );
    return result.rows[0];
  }

  static async findByFarm(farmId, filters = {}) {
    const { category, start_date, end_date, limit = 50 } = filters;
    let query = `SELECT d.*, u.name as user_name 
                 FROM diary d 
                 JOIN users u ON u.id = d.user_id 
                 WHERE d.farm_id = $1`;
    const values = [farmId];
    let paramCount = 2;

    if (category) {
      query += ` AND d.category = $${paramCount++}`;
      values.push(category);
    }
    if (start_date) {
      query += ` AND d.date >= $${paramCount++}`;
      values.push(start_date);
    }
    if (end_date) {
      query += ` AND d.date <= $${paramCount++}`;
      values.push(end_date);
    }

    query += ` ORDER BY d.date DESC, d.created_at DESC LIMIT $${paramCount++}`;
    values.push(limit);

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async update(id, farmId, data) {
    const { title, content, category, date } = data;
    const result = await pool.query(
      `UPDATE diary SET title = $1, content = $2, category = $3, date = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 AND farm_id = $6 RETURNING *`,
      [title, content, category, date, id, farmId]
    );
    return result.rows[0];
  }

  static async delete(id, farmId) {
    const result = await pool.query(
      'DELETE FROM diary WHERE id = $1 AND farm_id = $2 RETURNING *',
      [id, farmId]
    );
    return result.rows[0];
  }
}