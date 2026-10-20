import { Dashboard } from '../models/Dashboard.js';
import { userFarmIds, isAdmin } from '../utils/auth.js';
import { logger } from '../utils/logger.js';

const withFail = (name) => async (req, res) => {
  try {
    const farmIds = await userFarmIds(req.user);
    const data = await Dashboard[name](farmIds);
    res.json(data);
  } catch (error) {
    logger.error(`Dashboard ${name} error:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const farmIds = await userFarmIds(req.user);
    const [summary, breakdown, trend, species, tasks] = await Promise.all([
      Dashboard.summary(farmIds),
      Dashboard.farmBreakdown(farmIds),
      Dashboard.monthlyTrend(farmIds),
      Dashboard.livestockBySpecies(farmIds),
      Dashboard.taskStatusBreakdown(farmIds),
    ]);
    res.json({
      scope: isAdmin(req.user) ? 'all' : 'own',
      summary,
      farms: breakdown,
      trend,
      livestock_by_species: species,
      tasks_by_status: tasks,
    });
  } catch (error) {
    logger.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFarmBreakdown = withFail('farmBreakdown');
export const getMonthlyTrend = withFail('monthlyTrend');
