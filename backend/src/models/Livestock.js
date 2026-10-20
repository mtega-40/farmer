import pool from '../database/config.js';

const ALLOWED_LIVESTOCK_COLUMNS = [
  'tag_number', 'species', 'breed', 'age_months', 'weight_kg',
  'health_status', 'purchase_date', 'purchase_price', 'farm_id',
];

export class Livestock {
  static async create(farmId, data) {
    const { tag_number, species, breed, age_months, weight_kg, health_status, purchase_date, purchase_price } = data;
    const result = await pool.query(
      `INSERT INTO livestock (farm_id, tag_number, species, breed, age_months, weight_kg, health_status, purchase_date, purchase_price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [farmId, tag_number, species, breed, age_months || null, weight_kg || null, health_status, purchase_date || null, purchase_price || null]
    );
    return result.rows[0];
  }

  static async findByFarm(farmId) {
    const result = await pool.query(
      'SELECT * FROM livestock WHERE farm_id = $1 ORDER BY created_at DESC',
      [farmId]
    );
    return result.rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    for (const key of Object.keys(data)) {
      if (!ALLOWED_LIVESTOCK_COLUMNS.includes(key)) continue;
      fields.push(`${key} = $${paramCount++}`);
      values.push(data[key] || null);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const query = `UPDATE livestock SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM livestock WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}