import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { workerAPI, authAPI } from '../../api/index';
import { useFarms } from '../../hooks/useFarms';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const EMPTY = {
  user_id: '',
  position: '',
  salary: '',
  hire_date: '',
  status: 'active',
};

const WorkerForm = () => {
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
    const loadSelf = async () => {
      try {
        const res = await authAPI.getProfile();
        setMyId(res.data.id);
      } catch (error) {
        setMyId(null);
      }
    };
    loadSelf();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await workerAPI.getAll(routeFarmId);
        const worker = res.data.find((w) => String(w.id) === String(id));
        if (!worker) {
          toast.error('Worker record not found');
          return;
        }
        setFormData({
          user_id: worker.user_id ?? '',
          position: worker.position || '',
          salary: worker.salary ?? '',
          hire_date: worker.hire_date ? worker.hire_date.slice(0, 10) : '',
          status: worker.status || 'active',
        });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load worker');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [routeFarmId, id, isEdit]);

  const validate = () => {
    const next = {};
    if (!farmId) next.farmId = 'Select a farm';
    if (!isEdit && !formData.user_id) next.user_id = 'User ID is required';
    if (formData.salary !== '' && Number(formData.salary) < 0) {
      next.salary = 'Salary cannot be negative';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        user_id: formData.user_id === '' ? null : Number(formData.user_id),
        position: formData.position.trim(),
        salary: formData.salary === '' ? null : Number(formData.salary),
        hire_date: formData.hire_date || null,
        status: formData.status,
      };
      if (isEdit) {
        await workerAPI.update(routeFarmId, id, payload);
        toast.success('Worker updated');
      } else {
        await workerAPI.create(farmId, payload);
        toast.success('Worker added');
      }
      navigate(routeFarmId ? `/farms/${routeFarmId}/workers` : '/workers');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save worker');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const backTo = routeFarmId ? `/farms/${routeFarmId}/workers` : '/workers';

  return (
    <div className="max-w-2xl">
      <Link to={backTo} className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Workers
      </Link>

      <PageHeader
        title={isEdit ? 'Edit Worker' : 'Add Worker'}
        subtitle={isEdit ? 'Update worker details' : 'Assign a registered user to this farm'}
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farm *</label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="select-field"
              >
                <option value="">Select farm</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
              {errors.farmId && <p className="text-sm text-red-600 mt-1">{errors.farmId}</p>}
            </div>
          )}

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
              <input
                type="number"
                name="user_id"
                required
                value={formData.user_id}
                onChange={handleChange}
                className="input-field"
                placeholder="Registered user ID"
              />
              {errors.user_id && <p className="text-sm text-red-600 mt-1">{errors.user_id}</p>}
              {myId && (
                <p className="text-xs text-gray-500 mt-1">Your own user ID is {myId}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Farm Manager"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary ($)</label>
              <input
                type="number"
                name="salary"
                step="0.01"
                min="0"
                value={formData.salary}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
              />
              {errors.salary && <p className="text-sm text-red-600 mt-1">{errors.salary}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="select-field">
                <option value="active">Active</option>
                <option value="on_leave">On leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : isEdit ? 'Update Worker' : 'Add Worker'}
            </button>
            <Link to={backTo} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerForm;
