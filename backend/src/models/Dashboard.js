import pool from '../database/config.js';

export class Dashboard {
  static async summary(farmIds) {
    const adminScope = farmIds.length === 0;
    const idFilter = adminScope ? '' : `AND farm_id = ANY($1)`;
    const values = adminScope ? [] : [farmIds];

    const result = await pool.query(
      `SELECT
        (SELECT COUNT(*)::int FROM farms ${adminScope ? '' : 'WHERE id = ANY($1)'}) as total_farms,
        (SELECT COUNT(*)::int FROM livestock ${adminScope ? '' : 'WHERE farm_id = ANY($1)'}) as total_livestock,
        (SELECT COUNT(*)::int FROM fields ${adminScope ? '' : 'WHERE farm_id = ANY($1)'}) as total_fields,
        (SELECT COUNT(*)::int FROM inventory ${adminScope ? '' : 'WHERE farm_id = ANY($1)'}) as total_inventory,
        (SELECT COUNT(*)::int FROM tasks WHERE status <> 'completed' ${adminScope ? '' : 'AND farm_id = ANY($1)'}) as open_tasks,
        (SELECT COUNT(*)::int FROM inventory WHERE quantity <= min_quantity ${adminScope ? '' : 'AND farm_id = ANY($1)'}) as low_stock,
        (SELECT COALESCE(SUM(amount), 0) FROM income ${adminScope ? '' : 'WHERE farm_id = ANY($1)'}) as total_income,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses ${adminScope ? '' : 'WHERE farm_id = ANY($1)'}) as total_expenses`,
      values
    );

    const row = result.rows[0];
    const totalIncome = parseFloat(row.total_income);
    const totalExpenses = parseFloat(row.total_expenses);

    return {
      total_farms: row.total_farms,
      total_livestock: row.total_livestock,
      total_fields: row.total_fields,
      total_inventory: row.total_inventory,
      open_tasks: row.open_tasks,
      low_stock: row.low_stock,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: totalIncome - totalExpenses,
    };
  }

  static async farmBreakdown(farmIds) {
    const adminScope = farmIds.length === 0;
    const result = await pool.query(
      `SELECT f.id, f.name, f.location, f.area_hectares,
        (SELECT COUNT(*)::int FROM livestock l WHERE l.farm_id = f.id) as livestock_count,
        (SELECT COUNT(*)::int FROM inventory i WHERE i.farm_id = f.id) as inventory_count,
        (SELECT COUNT(*)::int FROM tasks t WHERE t.farm_id = f.id AND t.status <> 'completed') as open_tasks,
        (SELECT COALESCE(SUM(amount), 0) FROM income inc WHERE inc.farm_id = f.id) as income,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses exp WHERE exp.farm_id = f.id) as expenses
       FROM farms f
       ${adminScope ? '' : 'WHERE f.id = ANY($1)'}
       ORDER BY income DESC`,
      adminScope ? [] : [farmIds]
    );
    return result.rows.map((r) => ({
      ...r,
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
      net_profit: parseFloat(r.income) - parseFloat(r.expenses),
    }));
  }

  static async monthlyTrend(farmIds) {
    const adminScope = farmIds.length === 0;
    const where = adminScope ? '' : 'WHERE farm_id = ANY($1)';
    const values = adminScope ? [] : [farmIds];

    const income = await pool.query(
      `SELECT to_char(date_trunc('month', date), 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as total
       FROM income ${where} GROUP BY 1 ORDER BY 1`,
      values
    );
    const expenses = await pool.query(
      `SELECT to_char(date_trunc('month', date), 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as total
       FROM expenses ${where} GROUP BY 1 ORDER BY 1`,
      values
    );

    const byMonth = new Map();
    const ensure = (month) => {
      if (!byMonth.has(month)) byMonth.set(month, { month, income: 0, expenses: 0 });
      return byMonth.get(month);
    };
    income.rows.forEach((r) => { ensure(r.month).income = parseFloat(r.total); });
    expenses.rows.forEach((r) => { ensure(r.month).expenses = parseFloat(r.total); });

    return [...byMonth.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((r) => ({ ...r, net_profit: r.income - r.expenses }));
  }

  static async livestockBySpecies(farmIds) {
    const adminScope = farmIds.length === 0;
    const result = await pool.query(
      `SELECT species, COUNT(*)::int as count FROM livestock
       ${adminScope ? '' : 'WHERE farm_id = ANY($1)'}
       GROUP BY species ORDER BY count DESC`,
      adminScope ? [] : [farmIds]
    );
    return result.rows;
  }

  static async taskStatusBreakdown(farmIds) {
    const adminScope = farmIds.length === 0;
    const result = await pool.query(
      `SELECT status, COUNT(*)::int as count FROM tasks
       ${adminScope ? '' : 'WHERE farm_id = ANY($1)'}
       GROUP BY status ORDER BY status`,
      adminScope ? [] : [farmIds]
    );
    return result.rows;
  }
}
