import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { farmAPI } from '../../api/index';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const EMPTY = { name: '', location: '', area_hectares: '' };

const FarmForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = !!id;

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await farmAPI.get(id);
        setFormData({
          name: res.data.name || '',
          location: res.data.location || '',
          area_hectares: res.data.area_hectares ?? '',
        });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load farm');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = 'Farm name is required';
    if (formData.area_hectares !== '' && Number(formData.area_hectares) < 0) {
      next.area_hectares = 'Area cannot be negative';
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
        name: formData.name.trim(),
        location: formData.location.trim(),
        area_hectares: formData.area_hectares === '' ? null : Number(formData.area_hectares),
      };
      if (isEdit) {
        await farmAPI.update(id, payload);
        toast.success('Farm updated successfully');
        navigate(`/farms/${id}`);
      } else {
        await farmAPI.create(payload);
        toast.success('Farm created successfully');
        navigate('/farms');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || (isEdit ? 'Failed to update farm' : 'Failed to create farm'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl">
      <Link
        to={isEdit ? `/farms/${id}` : '/farms'}
        className="inline-flex items-center text-green-600 hover:text-green-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {isEdit ? 'Back to Farm' : 'Back to Farms'}
      </Link>

      <PageHeader
        title={isEdit ? 'Edit Farm' : 'Create New Farm'}
        subtitle={isEdit ? 'Update farm details' : 'Add a new farm to your management system'}
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Green Valley Farm"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Iowa, USA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Area (Hectares)</label>
            <input
              type="number"
              name="area_hectares"
              step="0.01"
              min="0"
              value={formData.area_hectares}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 50.5"
            />
            {errors.area_hectares && <p className="text-sm text-red-600 mt-1">{errors.area_hectares}</p>}
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : isEdit ? 'Update Farm' : 'Create Farm'}
            </button>
            <Link to={isEdit ? `/farms/${id}` : '/farms'} className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmForm;
