import pool from '../database/config.js';

const ALLOWED_INVENTORY_COLUMNS = ['name', 'category', 'quantity', 'unit', 'min_quantity', 'unit_price', 'supplier', 'farm_id'];

export class Inventory {
  static async create(farmId, data) {
    const { name, category, quantity, unit, min_quantity, unit_price, supplier } = data;
    const result = await pool.query(
      `INSERT INTO inventory (farm_id, name, category, quantity, unit, min_quantity, unit_price, supplier) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [farmId, name, category, quantity, unit, min_quantity, unit_price, supplier]
    );
    return result.rows[0];
  }

  static async findByFarm(farmId) {
    const result = await pool.query(
      'SELECT * FROM inventory WHERE farm_id = $1 ORDER BY name ASC',
      [farmId]
    );
    return result.rows;
  }

  static async getLowStock(farmId) {
    const result = await pool.query(
      'SELECT * FROM inventory WHERE farm_id = $1 AND quantity <= min_quantity ORDER BY name ASC',
      [farmId]
    );
    return result.rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    for (const key of Object.keys(data)) {
      if (!ALLOWED_INVENTORY_COLUMNS.includes(key)) continue;
      fields.push(`${key} = $${paramCount++}`);
      values.push(data[key]);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const query = `UPDATE inventory SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}