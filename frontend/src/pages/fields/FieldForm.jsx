import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fieldAPI } from '../../api/index';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '',
  area_hectares: '',
  soil_type: '',
  crop_type: '',
  planting_date: '',
  status: 'planted',
};

const FieldForm = () => {
  const { farmId, id } = useParams();
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
        const res = await fieldAPI.getAll(farmId);
        const field = res.data.find((f) => String(f.id) === String(id));
        if (!field) {
          toast.error('Field not found');
          return;
        }
        setFormData({
          name: field.name || '',
          area_hectares: field.area_hectares ?? '',
          soil_type: field.soil_type || '',
          crop_type: field.crop_type || '',
          planting_date: field.planting_date ? field.planting_date.slice(0, 10) : '',
          status: field.status || 'planted',
        });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load field');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [farmId, id, isEdit]);

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = 'Field name is required';
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
        area_hectares: formData.area_hectares === '' ? null : Number(formData.area_hectares),
        soil_type: formData.soil_type.trim(),
        crop_type: formData.crop_type.trim(),
        planting_date: formData.planting_date || null,
        status: formData.status,
      };
      if (isEdit) {
        await fieldAPI.update(farmId, id, payload);
        toast.success('Field updated');
        navigate(`/farms/${farmId}/fields`);
      } else {
        await fieldAPI.create(farmId, payload);
        toast.success('Field created');
        navigate(`/farms/${farmId}/fields`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save field');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const backTo = `/farms/${farmId}/fields`;

  return (
    <div className="max-w-2xl">
      <Link to={backTo} className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Fields
      </Link>

      <PageHeader
        title={isEdit ? 'Edit Field' : 'Add Field'}
        subtitle={isEdit ? 'Update field details' : 'Register a crop field'}
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Field Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., North Paddock"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="0.00"
              />
              {errors.area_hectares && <p className="text-sm text-red-600 mt-1">{errors.area_hectares}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
              <input
                type="text"
                name="soil_type"
                value={formData.soil_type}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Loamy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
              <input
                type="text"
                name="crop_type"
                value={formData.crop_type}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Maize"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Planting Date</label>
              <input
                type="date"
                name="planting_date"
                value={formData.planting_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="select-field">
              <option value="planted">Planted</option>
              <option value="growing">Growing</option>
              <option value="harvested">Harvested</option>
              <option value="fallow">Fallow</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : isEdit ? 'Update Field' : 'Create Field'}
            </button>
            <Link to={backTo} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldForm;
