import bcrypt from 'bcryptjs';
import pool from '../database/config.js';
import { ALL_ROLES } from '../utils/roles.js';

const SALT_ROUNDS = 12;

export class User {
  static async create({ name, email, password, role, phone }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role, phone, created_at`,
      [name, email, hashedPassword, role, phone]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async comparePassword(candidate, hashed) {
    return bcrypt.compare(candidate, hashed);
  }

  static async count() {
    const result = await pool.query('SELECT COUNT(*)::int as total FROM users');
    return result.rows[0].total;
  }

  static async findAll({ role, search } = {}) {
    const values = [];
    const conditions = [];
    if (role) {
      values.push(role);
      conditions.push(`role = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length})`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
              (SELECT COUNT(*)::int FROM farms f WHERE f.owner_id = u.id) as farms_owned,
              (SELECT COUNT(*)::int FROM workers w WHERE w.user_id = u.id) as farms_working
       FROM users u ${where}
       ORDER BY u.created_at DESC`,
      values
    );
    return result.rows;
  }

  static async findByIdWithStats(id) {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
              (SELECT COUNT(*)::int FROM farms f WHERE f.owner_id = u.id) as farms_owned,
              (SELECT COUNT(*)::int FROM workers w WHERE w.user_id = u.id) as farms_working
       FROM users u WHERE u.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async updateRole(id, role) {
    if (!ALL_ROLES.includes(role)) {
      throw new Error('Invalid role');
    }
    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING id, name, email, role, phone`,
      [role, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
      [id]
    );
    return result.rows[0];
  }

  static async getSystemStats() {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users) as total_users,
        (SELECT COUNT(*)::int FROM users WHERE role = 'admin') as admins,
        (SELECT COUNT(*)::int FROM users WHERE role = 'owner') as owners,
        (SELECT COUNT(*)::int FROM users WHERE role = 'manager') as managers,
        (SELECT COUNT(*)::int FROM users WHERE role = 'worker') as workers,
        (SELECT COUNT(*)::int FROM farms) as total_farms,
        (SELECT COUNT(*)::int FROM fields) as total_fields,
        (SELECT COUNT(*)::int FROM livestock) as total_livestock,
        (SELECT COUNT(*)::int FROM inventory) as total_inventory,
        (SELECT COUNT(*)::int FROM tasks WHERE status <> 'completed') as open_tasks,
        (SELECT COALESCE(SUM(amount), 0) FROM income) as total_income,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses) as total_expenses
    `);
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'password') {
        const hashed = await bcrypt.hash(value, SALT_ROUNDS);
        fields.push(`${key} = $${paramCount++}`);
        values.push(hashed);
      } else {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} 
                    RETURNING id, name, email, role, phone`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}