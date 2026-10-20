import pool from '../database/config.js';

export class Finance {
  static async createExpense(farmId, userId, data) {
    const { category, description, amount, date } = data;
    const result = await pool.query(
      `INSERT INTO expenses (farm_id, category, description, amount, date, recorded_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [farmId, category, description, amount, date, userId]
    );
    return result.rows[0];
  }

  static async createIncome(farmId, userId, data) {
    const { category, description, amount, date } = data;
    const result = await pool.query(
      `INSERT INTO income (farm_id, category, description, amount, date, recorded_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [farmId, category, description, amount, date, userId]
    );
    return result.rows[0];
  }

  static async getExpenses(farmId, filters = {}) {
    const { category, start_date, end_date } = filters;
    let query = 'SELECT * FROM expenses WHERE farm_id = $1';
    const values = [farmId];
    let paramCount = 2;

    if (category) {
      query += ` AND category = $${paramCount++}`;
      values.push(category);
    }
    if (start_date) {
      query += ` AND date >= $${paramCount++}`;
      values.push(start_date);
    }
    if (end_date) {
      query += ` AND date <= $${paramCount++}`;
      values.push(end_date);
    }

    query += ' ORDER BY date DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getIncome(farmId, filters = {}) {
    const { category, start_date, end_date } = filters;
    let query = 'SELECT * FROM income WHERE farm_id = $1';
    const values = [farmId];
    let paramCount = 2;

    if (category) {
      query += ` AND category = $${paramCount++}`;
      values.push(category);
    }
    if (start_date) {
      query += ` AND date >= $${paramCount++}`;
      values.push(start_date);
    }
    if (end_date) {
      query += ` AND date <= $${paramCount++}`;
      values.push(end_date);
    }

    query += ' ORDER BY date DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getSummary(farmId, start_date, end_date) {
    const dateFilter = start_date && end_date 
      ? `WHERE date BETWEEN $2 AND $3` 
      : '';
    const values = start_date && end_date ? [farmId, start_date, end_date] : [farmId];

    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE farm_id = $1 ${start_date && end_date ? 'AND date BETWEEN $2 AND $3' : ''}`,
      values
    );
    const incomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE farm_id = $1 ${start_date && end_date ? 'AND date BETWEEN $2 AND $3' : ''}`,
      values
    );

    return {
      total_expenses: parseFloat(expenseResult.rows[0].total),
      total_income: parseFloat(incomeResult.rows[0].total),
      net_profit: parseFloat(incomeResult.rows[0].total) - parseFloat(expenseResult.rows[0].total),
    };
  }
}