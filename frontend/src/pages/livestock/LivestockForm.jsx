import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { livestockAPI } from '../../api/index';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const SPECIES = ['cow', 'goat', 'sheep', 'chicken', 'pig', 'horse', 'duck', 'other'];

const EMPTY = {
  tag_number: '',
  species: '',
  breed: '',
  age_months: '',
  weight_kg: '',
  health_status: 'healthy',
  purchase_date: '',
  purchase_price: '',
};

const LivestockForm = () => {
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
        const res = await livestockAPI.getAll(farmId);
        const animal = res.data.find((a) => String(a.id) === String(id));
        if (!animal) {
          toast.error('Animal not found');
          return;
        }
        setFormData({
          tag_number: animal.tag_number || '',
          species: animal.species || '',
          breed: animal.breed || '',
          age_months: animal.age_months ?? '',
          weight_kg: animal.weight_kg ?? '',
          health_status: animal.health_status || 'healthy',
          purchase_date: animal.purchase_date ? animal.purchase_date.slice(0, 10) : '',
          purchase_price: animal.purchase_price ?? '',
        });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load animal');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [farmId, id, isEdit]);

  const validate = () => {
    const next = {};
    if (!formData.tag_number.trim()) next.tag_number = 'Tag number is required';
    if (!formData.species) next.species = 'Species is required';
    if (formData.age_months !== '' && Number(formData.age_months) < 0) {
      next.age_months = 'Age cannot be negative';
    }
    if (formData.weight_kg !== '' && Number(formData.weight_kg) < 0) {
      next.weight_kg = 'Weight cannot be negative';
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
        tag_number: formData.tag_number.trim(),
        species: formData.species,
        breed: formData.breed.trim(),
        age_months: formData.age_months === '' ? null : Number(formData.age_months),
        weight_kg: formData.weight_kg === '' ? null : Number(formData.weight_kg),
        health_status: formData.health_status,
        purchase_date: formData.purchase_date || null,
        purchase_price: formData.purchase_price === '' ? null : Number(formData.purchase_price),
      };
      if (isEdit) {
        await livestockAPI.update(farmId, id, payload);
        toast.success('Livestock updated');
      } else {
        await livestockAPI.create(farmId, payload);
        toast.success('Livestock added');
      }
      navigate(`/farms/${farmId}/livestock`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save livestock');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const backTo = `/farms/${farmId}/livestock`;

  return (
    <div className="max-w-2xl">
      <Link to={backTo} className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Livestock
      </Link>

      <PageHeader
        title={isEdit ? 'Edit Livestock' : 'Add Livestock'}
        subtitle={isEdit ? 'Update animal details' : 'Register a new animal'}
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag Number *</label>
            <input
              type="text"
              name="tag_number"
              required
              value={formData.tag_number}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., COW-001"
            />
            {errors.tag_number && <p className="text-sm text-red-600 mt-1">{errors.tag_number}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Species *</label>
              <select name="species" required value={formData.species} onChange={handleChange} className="select-field">
                <option value="">Select species</option>
                {SPECIES.map((s) => (
                  <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              {errors.species && <p className="text-sm text-red-600 mt-1">{errors.species}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Holstein"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age (months)</label>
              <input
                type="number"
                name="age_months"
                min="0"
                value={formData.age_months}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
              />
              {errors.age_months && <p className="text-sm text-red-600 mt-1">{errors.age_months}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                name="weight_kg"
                step="0.01"
                min="0"
                value={formData.weight_kg}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
              />
              {errors.weight_kg && <p className="text-sm text-red-600 mt-1">{errors.weight_kg}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Health Status</label>
            <select name="health_status" value={formData.health_status} onChange={handleChange} className="select-field">
              <option value="healthy">Healthy</option>
              <option value="sick">Sick</option>
              <option value="recovering">Recovering</option>
              <option value="under_treatment">Under Treatment</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price ($)</label>
              <input
                type="number"
                name="purchase_price"
                step="0.01"
                min="0"
                value={formData.purchase_price}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : isEdit ? 'Update Livestock' : 'Add Livestock'}
            </button>
            <Link to={backTo} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LivestockForm;
