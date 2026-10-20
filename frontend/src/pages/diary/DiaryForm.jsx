import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { diaryAPI } from '../../api/index';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const CATEGORIES = ['general', 'observation', 'planting', 'harvest', 'livestock', 'maintenance', 'weather'];

const EMPTY = {
  title: '',
  content: '',
  category: 'general',
  date: new Date().toISOString().slice(0, 10),
};

const DiaryForm = () => {
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
        const res = await diaryAPI.getAll(farmId);
        const entry = res.data.find((e) => String(e.id) === String(id));
        if (!entry) {
          toast.error('Diary entry not found');
          return;
        }
        setFormData({
          title: entry.title || '',
          content: entry.content || '',
          category: entry.category || 'general',
          date: entry.date ? entry.date.slice(0, 10) : '',
        });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load entry');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [farmId, id, isEdit]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!formData.title.trim()) next.title = 'Title is required';
    if (!formData.content.trim()) next.content = 'Content is required';
    if (!formData.date) next.date = 'Date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        date: formData.date,
      };
      if (isEdit) {
        await diaryAPI.update(farmId, id, payload);
        toast.success('Entry updated');
      } else {
        await diaryAPI.create(farmId, payload);
        toast.success('Entry added');
      }
      navigate(`/farms/${farmId}/diary`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const backTo = `/farms/${farmId}/diary`;

  return (
    <div className="max-w-2xl">
      <Link to={backTo} className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Diary
      </Link>

      <PageHeader
        title={isEdit ? 'Edit Diary Entry' : 'New Diary Entry'}
        subtitle={isEdit ? 'Update this record' : 'Record what happened on the farm'}
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Sprayed the maize field"
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="select-field">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
              />
              {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea
              name="content"
              rows="6"
              required
              value={formData.content}
              onChange={handleChange}
              className="textarea-field"
              placeholder="Describe the work, observations, or events"
            />
            {errors.content && <p className="text-sm text-red-600 mt-1">{errors.content}</p>}
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : isEdit ? 'Update Entry' : 'Save Entry'}
            </button>
            <Link to={backTo} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiaryForm;
