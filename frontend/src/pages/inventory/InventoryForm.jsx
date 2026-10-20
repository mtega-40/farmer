import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { inventoryAPI } from '../../api/index';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '',
  category: '',
  unit: '',
  quantity: '',
  min_quantity: '',
  unit_price: '',
  supplier: '',
};

const InventoryForm = () => {
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
        const res = await inventoryAPI.getAll(farmId);
        const item = res.data.find((i) => String(i.id) === String(id));
        if (!item) {
          toast.error('Item not found');
          return;
        }
        setFormData({
          name: item.name || '',
          category: item.category || '',
          unit: item.unit || '',
          quantity: item.quantity ?? '',
          min_quantity: item.min_quantity ?? '',
          unit_price: item.unit_price ?? '',
          supplier: item.supplier || '',
        });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [farmId, id, isEdit]);

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = 'Item name is required';
    if (formData.quantity !== '' && Number(formData.quantity) < 0) {
      next.quantity = 'Quantity cannot be negative';
    }
    if (formData.min_quantity !== '' && Number(formData.min_quantity) < 0) {
      next.min_quantity = 'Minimum cannot be negative';
    }
    if (formData.unit_price !== '' && Number(formData.unit_price) < 0) {
      next.unit_price = 'Unit price cannot be negative';
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
        category: formData.category.trim(),
        unit: formData.unit.trim(),
        quantity: formData.quantity === '' ? 0 : Number(formData.quantity),
        min_quantity: formData.min_quantity === '' ? 0 : Number(formData.min_quantity),
        unit_price: formData.unit_price === '' ? null : Number(formData.unit_price),
        supplier: formData.supplier.trim(),
      };
      if (isEdit) {
        await inventoryAPI.update(farmId, id, payload);
        toast.success('Item updated');
      } else {
        await inventoryAPI.create(farmId, payload);
        toast.success('Item added');
      }
      navigate(`/farms/${farmId}/inventory`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const backTo = `/farms/${farmId}/inventory`;

  return (
    <div className="max-w-2xl">
      <Link to={backTo} className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Inventory
      </Link>

      <PageHeader
        title={isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}
        subtitle={isEdit ? 'Update stock details' : 'Add supplies or stock'}
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Cattle Feed"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Feed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., bags"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                name="quantity"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
              />
              {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Level</label>
              <input
                type="number"
                name="min_quantity"
                min="0"
                step="0.01"
                value={formData.min_quantity}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
              />
              {errors.min_quantity && <p className="text-sm text-red-600 mt-1">{errors.min_quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price ($)</label>
              <input
                type="number"
                name="unit_price"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
              />
              {errors.unit_price && <p className="text-sm text-red-600 mt-1">{errors.unit_price}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., AgroSupply Co."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
            </button>
            <Link to={backTo} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
