import pool from '../database/config.js';

const ALLOWED_TASK_COLUMNS = ['title', 'description', 'assigned_to', 'priority', 'due_date', 'status', 'farm_id'];

export class Task {
  static async create(farmId, data) {
    const { title, description, assigned_to, priority, due_date } = data;
    const result = await pool.query(
      `INSERT INTO tasks (farm_id, title, description, assigned_to, priority, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [farmId, title, description || null, assigned_to || null, priority, due_date || null]
    );
    return result.rows[0];
  }

  static async findByFarm(farmId, filters = {}) {
    const { status, assigned_to } = filters;
    let query = 'SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON u.id = t.assigned_to WHERE t.farm_id = $1';
    const values = [farmId];
    let paramCount = 2;

    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      values.push(status);
    }
    if (assigned_to) {
      query += ` AND t.assigned_to = $${paramCount++}`;
      values.push(assigned_to);
    }

    query += ' ORDER BY t.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    for (const key of Object.keys(data)) {
      if (!ALLOWED_TASK_COLUMNS.includes(key)) continue;
      fields.push(`${key} = $${paramCount++}`);
      values.push(data[key] || null);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async complete(id) {
    const result = await pool.query(
      'UPDATE tasks SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['completed', id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}