import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { financeAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import { useFarmScope } from '../../hooks/useFarmScope';
import { DollarSign, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, FarmPicker, StatCard, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const Finance = () => {
  const { farmId, farm, farms, farmsLoading, selectFarm } = useFarmScope();
  const { can } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [summary, setSummary] = useState({ total_expenses: 0, total_income: 0, net_profit: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ start_date: '', end_date: '' });

  const load = async () => {
    if (!farmId) return;
    setLoading(true);
    const params = {
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    };
    try {
      const [expenseRes, incomeRes, summaryRes] = await Promise.all([
        financeAPI.getExpenses(farmId, params),
        financeAPI.getIncome(farmId, params),
        financeAPI.getSummary(farmId, params),
      ]);
      setExpenses(expenseRes.data);
      setIncome(incomeRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  const applyFilters = (e) => {
    e.preventDefault();
    load();
  };

  const clearFilters = () => {
    setFilters({ start_date: '', end_date: '' });
  };

  if (farmsLoading && farms.length === 0) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Finance"
        subtitle={farm ? `Income and expenses for ${farm.name}` : 'Select a farm to view its finances'}
        actions={
          can('finance', 'create') && farmId ? (
            <>
              <Link to={`/farms/${farmId}/finance/income/new`} className="btn-secondary flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Add Income
              </Link>
              <Link to={`/farms/${farmId}/finance/expense/new`} className="btn-primary flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Expense
              </Link>
            </>
          ) : null
        }
      />

      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <FarmPicker farms={farms} value={farmId} onChange={selectFarm} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters((p) => ({ ...p, start_date: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters((p) => ({ ...p, end_date: e.target.value }))}
              className="input-field"
            />
          </div>
          <button onClick={applyFilters} className="btn-primary">Apply</button>
          <button onClick={clearFilters} className="btn-secondary">Reset</button>
        </div>
      </div>

      {!farmId ? (
        <EmptyState icon={DollarSign} message="Select a farm to view its finances" />
      ) : loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <StatCard
              label="Total Income"
              value={`$${Number(summary.total_income || 0).toLocaleString()}`}
              icon={TrendingUp}
              color="bg-emerald-500"
            />
            <StatCard
              label="Total Expenses"
              value={`$${Number(summary.total_expenses || 0).toLocaleString()}`}
              icon={TrendingDown}
              color="bg-red-500"
            />
            <StatCard
              label="Net Profit"
              value={`$${Number(summary.net_profit || 0).toLocaleString()}`}
              icon={Wallet}
              color={Number(summary.net_profit || 0) >= 0 ? 'bg-green-500' : 'bg-red-600'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses ({expenses.length})</h2>
              {expenses.length === 0 ? (
                <p className="text-gray-500">No expenses recorded</p>
              ) : (
                <div className="space-y-3">
                  {expenses.map((e) => (
                    <div key={e.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{e.description || e.category}</p>
                        <p className="text-xs text-gray-500">
                          {e.category} • {new Date(e.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-red-600 font-semibold">
                        -${Number(e.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Income ({income.length})</h2>
              {income.length === 0 ? (
                <p className="text-gray-500">No income recorded</p>
              ) : (
                <div className="space-y-3">
                  {income.map((i) => (
                    <div key={i.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{i.description || i.category}</p>
                        <p className="text-xs text-gray-500">
                          <Badge tone="green">{i.category}</Badge>{' '}
                          <span className="ml-1">{new Date(i.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <span className="text-green-600 font-semibold">
                        +${Number(i.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Finance;
