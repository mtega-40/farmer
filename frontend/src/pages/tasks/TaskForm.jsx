import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { taskAPI, authAPI } from '../../api/index';
import { useFarms } from '../../hooks/useFarms';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '',
  description: '',
  assigned_to: '',
  priority: 'medium',
  due_date: '',
  status: 'pending',
};

const TaskForm = () => {
  const { farmId: routeFarmId, id } = useParams();
  const navigate = useNavigate();
  const { farms } = useFarms();

  const [farmId, setFarmId] = useState(routeFarmId || '');
  const [formData, setFormData] = useState(EMPTY);
  const [myId, setMyId] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = !!id;

  useEffect(() => {
    if (!routeFarmId && farms.length > 0) {
      setFarmId(String(farms[0].id));
    }
  }, [routeFarmId, farms]);

  useEffect(() => {
    authAPI
      .getProfile()
      .then((res) => setMyId(res.data.id))
      .catch(() => setMyId(null));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await taskAPI.getAll(routeFarmId);
        const task = res.data.find((t) => String(t.id) === String(id));
        if (!task) {
          toast.error('Task not found');
          return;
        }
        setFormData({
          title: task.title || '',
          description: task.description || '',
          assigned_to: task.assigned_to ?? '',
          priority: task.priority || 'medium',
          due_date: task.due_date ? task.due_date.slice(0, 10) : '',
          status: task.status || 'pending',
        });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [routeFarmId, id, isEdit]);

  const validate = () => {
    const next = {};
    if (!formData.title.trim()) next.title = 'Task title is required';
    if (!isEdit && !farmId) next.farmId = 'Select a farm';
    if (formData.due_date && new Date(formData.due_date) < new Date(new Date().toDateString())) {
      next.due_date = 'Due date cannot be in the past';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assigned_to: formData.assigned_to === '' ? null : Number(formData.assigned_to),
        priority: formData.priority,
        due_date: formData.due_date || null,
        status: formData.status,
      };
      if (isEdit) {
        await taskAPI.update(routeFarmId, id, payload);
        toast.success('Task updated');
        navigate(`/farms/${routeFarmId}/tasks`);
      } else {
        await taskAPI.create(farmId, payload);
        toast.success('Task created');
        navigate(`/farms/${farmId}/tasks`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const backTo = routeFarmId ? `/farms/${routeFarmId}/tasks` : '/tasks';

  return (
    <div className="max-w-2xl">
      <Link to={backTo} className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tasks
      </Link>

      <PageHeader
        title={isEdit ? 'Edit Task' : 'Add Task'}
        subtitle={isEdit ? 'Update task details' : 'Create a work item for this farm'}
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farm *</label>
              <select value={farmId} onChange={(e) => setFarmId(e.target.value)} className="select-field">
                <option value="">Select farm</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
              {errors.farmId && <p className="text-sm text-red-600 mt-1">{errors.farmId}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Fence the north pasture"
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="textarea-field"
              placeholder="Additional details"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign To (User ID)</label>
              <input
                type="number"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="input-field"
                placeholder="Unassigned"
              />
              {myId && <p className="text-xs text-gray-500 mt-1">Your own user ID is {myId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="select-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="input-field"
              />
              {errors.due_date && <p className="text-sm text-red-600 mt-1">{errors.due_date}</p>}
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="select-field">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
            <Link to={backTo} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
