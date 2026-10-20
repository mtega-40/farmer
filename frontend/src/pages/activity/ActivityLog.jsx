import React, { useState } from 'react';
import { activityLogAPI } from '../../api/index';
import { useFarmScope } from '../../hooks/useFarmScope';
import { Clock } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, FarmPicker, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const ACTION_TONE = {
  create: 'green',
  create_expense: 'orange',
  create_income: 'green',
  update: 'blue',
  complete: 'green',
  delete: 'red',
};

const ActivityLog = () => {
  const { farmId, farm, farms, farmsLoading, selectFarm } = useFarmScope();

  const [logs, setLogs] = useState([]);
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ module: '', action: '', start_date: '', end_date: '' });

  const load = async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const params = {
        module: filters.module || undefined,
        action: filters.action || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      };
      const [logsRes, modulesRes, actionsRes] = await Promise.all([
        activityLogAPI.getAll(farmId, params),
        activityLogAPI.getModules(farmId),
        activityLogAPI.getActions(farmId, filters.module || undefined),
      ]);
      setLogs(logsRes.data);
      setModules(modulesRes.data);
      setActions(actionsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  React.useEffect(() => {
    if (!farmId) return;
    activityLogAPI
      .getActions(farmId, filters.module || undefined)
      .then((res) => setActions(res.data))
      .catch(() => setActions([]));
  }, [farmId, filters.module]);

  const setFilter = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ module: '', action: '', start_date: '', end_date: '' });
  };

  if (farmsLoading && farms.length === 0) return <Spinner />;

  return (
    <div>
      <PageHeader title="Activity Log" subtitle={farm ? `Audit trail for ${farm.name}` : 'Select a farm'} />

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
            <select value={filters.module} onChange={setFilter('module')} className="select-field">
              <option value="">All modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select value={filters.action} onChange={setFilter('action')} className="select-field">
              <option value="">All actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input type="date" value={filters.start_date} onChange={setFilter('start_date')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input type="date" value={filters.end_date} onChange={setFilter('end_date')} className="input-field" />
          </div>
        </div>
        <div className="flex space-x-3 mt-4">
          <button onClick={load} className="btn-primary">Apply Filters</button>
          <button onClick={clearFilters} className="btn-secondary">Reset</button>
        </div>
      </div>

      {!farmId ? (
        <EmptyState icon={Clock} message="Select a farm to view its activity log" />
      ) : loading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <EmptyState icon={Clock} message="No activity recorded yet" />
      ) : (
        <div className="card">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mt-1"></div>
                  <div className="flex-1 w-px bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={ACTION_TONE[log.action] || 'gray'}>
                      {String(log.action).replace(/_/g, ' ')}
                    </Badge>
                    <Badge>{log.module}</Badge>
                    <span className="text-xs text-gray-500">
                      {log.user_name} • {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
