import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { taskAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import { useFarmScope } from '../../hooks/useFarmScope';
import { ClipboardList, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, FarmPicker, Badge, StatCard } from '../../components/ui';
import toast from 'react-hot-toast';

const PRIORITY_TONE = { high: 'red', medium: 'yellow', low: 'green' };
const STATUS_TONE = { pending: 'yellow', in_progress: 'blue', completed: 'green' };

const Tasks = () => {
  const { farmId, farm, farms, farmsLoading, selectFarm } = useFarmScope();
  const { can, user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [mineOnly, setMineOnly] = useState(false);

  const load = async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await taskAPI.getAll(farmId, params);
      setTasks(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(farmId, id);
      toast.success('Task deleted');
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleComplete = async (id) => {
    try {
      await taskAPI.complete(farmId, id);
      toast.success('Task marked complete');
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete task');
    }
  };

  if (farmsLoading && farms.length === 0) return <Spinner />;

  const open = tasks.filter((t) => t.status !== 'completed');
  const completed = tasks.filter((t) => t.status === 'completed');
  const visible = mineOnly ? tasks.filter((t) => String(t.assigned_to) === String(user?.id)) : tasks;

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={farm ? `Work items for ${farm.name}` : 'Select a farm to view its tasks'}
        actions={
          can('task', 'create') && farmId ? (
            <Link to={`/farms/${farmId}/tasks/new`} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Task
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-4 items-end mb-6">
        <FarmPicker farms={farms} value={farmId} onChange={selectFarm} />
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <label className="flex items-center text-sm text-gray-700 pb-2">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => setMineOnly(e.target.checked)}
            className="mr-2"
          />
          Assigned to me
        </label>
      </div>

      {!farmId ? (
        <EmptyState icon={ClipboardList} message="Select a farm to view its tasks" />
      ) : loading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          message="No tasks yet"
          action={
            can('task', 'create') ? (
              <Link to={`/farms/${farmId}/tasks/new`} className="btn-primary">
                Add first task
              </Link>
            ) : null
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={ClipboardList} message="No tasks match this filter" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <StatCard label="Open Tasks" value={open.length} icon={ClipboardList} color="bg-yellow-500" />
            <StatCard label="Completed" value={completed.length} icon={CheckCircle} color="bg-green-500" />
          </div>

          <div className="card overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Task', 'Assignee', 'Priority', 'Due Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {visible.map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{task.assignee_name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge tone={PRIORITY_TONE[task.priority] || 'gray'}>{task.priority}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge tone={STATUS_TONE[task.status] || 'gray'}>{task.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        {can('task', 'update') && task.status !== 'completed' && (
                          <button
                            onClick={() => handleComplete(task.id)}
                            className="btn-secondary px-2 py-1 flex items-center"
                            title="Mark complete"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {can('task', 'update') && (
                          <Link
                            to={`/farms/${farmId}/tasks/${task.id}/edit`}
                            className="btn-secondary px-2 py-1 flex items-center"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        {can('task', 'delete') && (
                          <button
                            onClick={() => handleDelete(task.id)}
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
        </>
      )}
    </div>
  );
};

export default Tasks;
