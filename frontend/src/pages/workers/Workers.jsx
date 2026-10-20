import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import { useFarmScope } from '../../hooks/useFarmScope';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, FarmPicker, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUS_TONE = {
  active: 'green',
  on_leave: 'yellow',
  inactive: 'gray',
};

const Workers = () => {
  const { farmId, farm, farms, farmsLoading, selectFarm } = useFarmScope();
  const { can } = useAuth();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const res = await workerAPI.getAll(farmId);
      setWorkers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this worker from the farm?')) return;
    try {
      await workerAPI.delete(farmId, id);
      toast.success('Worker removed');
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove worker');
    }
  };

  if (farmsLoading && farms.length === 0) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Workers"
        subtitle={farm ? `Staff at ${farm.name}` : 'Select a farm to view its workers'}
        actions={
          can('worker', 'create') && farmId ? (
            <Link to={`/farms/${farmId}/workers/new`} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Worker
            </Link>
          ) : null
        }
      />

      <div className="mb-6">
        <FarmPicker farms={farms} value={farmId} onChange={selectFarm} />
      </div>

      {!farmId ? (
        <EmptyState icon={Users} message="Select a farm to view its workers" />
      ) : loading ? (
        <Spinner />
      ) : workers.length === 0 ? (
        <EmptyState
          icon={Users}
          message="No workers yet"
          action={
            can('worker', 'create') ? (
              <Link to={`/farms/${farmId}/workers/new`} className="btn-primary">
                Add first worker
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Worker', 'Position', 'Salary', 'Hire Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {workers.map((worker) => (
                <tr key={worker.id}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{worker.name}</p>
                    <p className="text-xs text-gray-500">{worker.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{worker.position || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {worker.salary != null ? `$${Number(worker.salary).toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {worker.hire_date ? new Date(worker.hire_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge tone={STATUS_TONE[worker.status] || 'gray'}>
                      {String(worker.status || 'active').replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      {can('worker', 'update') && (
                        <Link
                          to={`/farms/${farmId}/workers/${worker.id}/edit`}
                          className="btn-secondary px-2 py-1 flex items-center"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}
                      {can('worker', 'delete') && (
                        <button
                          onClick={() => handleDelete(worker.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Workers;
