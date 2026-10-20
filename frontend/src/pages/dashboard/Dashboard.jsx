import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../api/index';
import { PERMISSION_LABELS } from '../../config/permissions';
import {
  Sprout, Beef, Package, Wheat, ClipboardList, TrendingUp,
  TrendingDown, Wallet, AlertTriangle, Users,
} from 'lucide-react';
import { PageHeader, Spinner, StatCard, EmptyState } from '../../components/ui';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardAPI.getSummary();
        setData(res.data);
      } catch (error) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  if (!data) {
    return <EmptyState message="Failed to load dashboard data" />;
  }

  const { summary, farms, trend } = data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name}. ${isAdmin ? 'Showing all farms across the system.' : 'Showing farms you have access to.'}`}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Farms" value={summary.total_farms} icon={Sprout} color="bg-green-500" />
        <StatCard label="Livestock" value={summary.total_livestock} icon={Beef} color="bg-emerald-500" />
        <StatCard label="Fields" value={summary.total_fields} icon={Wheat} color="bg-yellow-500" />
        <StatCard label="Inventory Items" value={summary.total_inventory} icon={Package} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <StatCard
          label="Total Income"
          value={`$${Number(summary.total_income).toLocaleString()}`}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <StatCard
          label="Total Expenses"
          value={`$${Number(summary.total_expenses).toLocaleString()}`}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          label="Net Profit"
          value={`$${Number(summary.net_profit).toLocaleString()}`}
          icon={Wallet}
          color={Number(summary.net_profit) >= 0 ? 'bg-green-500' : 'bg-red-600'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <StatCard label="Open Tasks" value={summary.open_tasks} icon={ClipboardList} color="bg-yellow-500" />
        <StatCard
          label="Low Stock Alerts"
          value={summary.low_stock}
          icon={AlertTriangle}
          color={summary.low_stock > 0 ? 'bg-orange-500' : 'bg-gray-400'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Farms Overview</h2>
          {farms.length === 0 ? (
            <p className="text-gray-500">
              No farms yet. <Link to="/farms" className="text-green-600">Create one</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {farms.slice(0, 8).map((farm) => (
                <Link
                  key={farm.id}
                  to={`/farms/${farm.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-gray-900">{farm.name}</h3>
                    <span className={`text-sm font-semibold ${Number(farm.net_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Number(farm.net_profit).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{farm.livestock_count} animals</span>
                    <span>{farm.inventory_count} items</span>
                    <span>{farm.open_tasks} open tasks</span>
                    <span>{farm.area_hectares || 0} ha</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Financial Trend</h2>
          {trend.length === 0 ? (
            <p className="text-gray-500">No financial records yet</p>
          ) : (
            <div className="space-y-3">
              {trend.slice(-8).map((row) => (
                <div key={row.month} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{row.month}</span>
                    <span className={`text-sm font-semibold ${row.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Number(row.net_profit).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <div className="flex-1">
                      <div className="flex justify-between text-gray-500 mb-1">
                        <span>Income</span>
                        <span>${Number(row.income).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded">
                        <div
                          className="h-2 bg-green-500 rounded"
                          style={{ width: `${Math.min(100, (Number(row.income) / Math.max(1, maxTrend(trend))) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-gray-500 mb-1">
                        <span>Expenses</span>
                        <span>${Number(row.expenses).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded">
                        <div
                          className="h-2 bg-red-500 rounded"
                          style={{ width: `${Math.min(100, (Number(row.expenses) / Math.max(1, maxTrend(trend))) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="card mt-6 flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Administrator</h3>
              <p className="text-sm text-gray-500">
                Signed in as {PERMISSION_LABELS[user.role]} with full system access
              </p>
            </div>
          </div>
          <Link to="/admin/users" className="btn-secondary">
            Manage Users
          </Link>
        </div>
      )}
    </div>
  );
};

const maxTrend = (trend) =>
  Math.max(...trend.map((t) => Math.max(Number(t.income), Number(t.expenses))), 1);

export default Dashboard;
