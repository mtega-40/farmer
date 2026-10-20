import pool from '../database/config.js';

const ALLOWED_FIELD_COLUMNS = ['name', 'area_hectares', 'soil_type', 'crop_type', 'planting_date', 'status', 'farm_id'];

export class Field {
  static async create(farmId, data) {
    const { name, area_hectares, soil_type, crop_type, planting_date, status } = data;
    const result = await pool.query(
      `INSERT INTO fields (farm_id, name, area_hectares, soil_type, crop_type, planting_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [farmId, name, area_hectares, soil_type, crop_type, planting_date, status || 'planted']
    );
    return result.rows[0];
  }

  static async findByFarm(farmId) {
    const result = await pool.query(
      'SELECT * FROM fields WHERE farm_id = $1 ORDER BY created_at DESC',
      [farmId]
    );
    return result.rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    for (const key of Object.keys(data)) {
      if (!ALLOWED_FIELD_COLUMNS.includes(key)) continue;
      fields.push(`${key} = $${paramCount++}`);
      values.push(data[key]);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const query = `UPDATE fields SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM fields WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}