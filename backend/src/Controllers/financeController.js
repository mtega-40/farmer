import { Finance } from '../models/Finance.js';
import { logger } from '../utils/logger.js';
import { logActivity } from '../utils/audit.js';

export const createExpense = async (req, res) => {
  try {
    const expense = await Finance.createExpense(req.params.farmId, req.user.id, req.body);
    logger.info(`Expense created: ${expense.id}`);
    logActivity(req, 'finance', 'create_expense', `Expense ${expense.category}: ${expense.amount}`);
    res.status(201).json({ message: 'Expense created successfully', expense });
  } catch (error) {
    logger.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createIncome = async (req, res) => {
  try {
    const income = await Finance.createIncome(req.params.farmId, req.user.id, req.body);
    logger.info(`Income created: ${income.id}`);
    logActivity(req, 'finance', 'create_income', `Income ${income.category}: ${income.amount}`);
    res.status(201).json({ message: 'Income created successfully', income });
  } catch (error) {
    logger.error('Create income error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { category, start_date, end_date } = req.query;
    const expenses = await Finance.getExpenses(req.params.farmId, { category, start_date, end_date });
    res.json(expenses);
  } catch (error) {
    logger.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIncome = async (req, res) => {
  try {
    const { category, start_date, end_date } = req.query;
    const income = await Finance.getIncome(req.params.farmId, { category, start_date, end_date });
    res.json(income);
  } catch (error) {
    logger.error('Get income error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const summary = await Finance.getSummary(req.params.farmId, start_date, end_date);
    res.json(summary);
  } catch (error) {
    logger.error('Get summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
