import pool from '../database/config.js';

const ALLOWED_FARM_COLUMNS = ['name', 'location', 'area_hectares', 'owner_id'];

export class Farm {
  static async create(ownerId, data) {
    const { name, location, area_hectares } = data;
    const result = await pool.query(
      `INSERT INTO farms (name, location, area_hectares, owner_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, location, area_hectares, ownerId]
    );
    return result.rows[0];
  }

  static async findAll(userId, role) {
    const query = role === 'admin'
      ? 'SELECT * FROM farms ORDER BY created_at DESC'
      : `SELECT DISTINCT f.* FROM farms f 
         LEFT JOIN workers w ON w.farm_id = f.id AND w.user_id = $1
         WHERE f.owner_id = $1 OR w.user_id = $1
         ORDER BY f.created_at DESC`;
    const values = role === 'admin' ? [] : [userId];
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM farms WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByIdForUser(id, userId, role) {
    const query = role === 'admin'
      ? 'SELECT * FROM farms WHERE id = $1'
      : `SELECT DISTINCT f.* FROM farms f 
         LEFT JOIN workers w ON w.farm_id = f.id AND w.user_id = $2
         WHERE f.id = $1 AND (f.owner_id = $2 OR w.user_id = $2)`;
    const values = role === 'admin' ? [id] : [id, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const key of Object.keys(data)) {
      if (!ALLOWED_FARM_COLUMNS.includes(key)) continue;
      fields.push(`${key} = $${paramCount++}`);
      values.push(data[key]);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE farms SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM farms WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}