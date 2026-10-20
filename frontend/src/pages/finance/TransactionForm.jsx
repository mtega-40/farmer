import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { financeAPI } from '../../api/index';
import { ArrowLeft, DollarSign, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import toast from 'react-hot-toast';

const CATEGORIES = {
  expense: ['feed', 'fertilizer', 'equipment', 'labor', 'veterinary', 'transport', 'utilities', 'other'],
  income: ['crop_sale', 'livestock_sale', 'milk', 'eggs', 'subsidy', 'other'],
};

const TransactionForm = ({ kind }) => {
  const { farmId } = useParams();
  const navigate = useNavigate();
  const isExpense = kind === 'expense';

  const [formData, setFormData] = useState({
    category: CATEGORIES[kind][0],
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!formData.amount || Number(formData.amount) <= 0) {
      next.amount = 'Amount must be greater than zero';
    }
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
        category: formData.category,
        description: formData.description.trim(),
        amount: Number(formData.amount),
        date: formData.date,
      };
      if (isExpense) {
        await financeAPI.createExpense(farmId, payload);
        toast.success('Expense recorded');
      } else {
        await financeAPI.createIncome(farmId, payload);
        toast.success('Income recorded');
      }
      navigate(`/farms/${farmId}/finance`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const backTo = `/farms/${farmId}/finance`;

  return (
    <div className="max-w-2xl">
      <Link to={backTo} className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Finance
      </Link>

      <PageHeader
        title={isExpense ? 'Record Expense' : 'Record Income'}
        subtitle={isExpense ? 'Log money spent on the farm' : 'Log money earned by the farm'}
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="select-field">
              {CATEGORIES[kind].map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder={isExpense ? 'e.g., Bought 20 bags of cattle feed' : 'e.g., Sold maize harvest'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($) *</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
              />
              {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
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

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary flex items-center">
              {saving ? (
                'Saving...'
              ) : isExpense ? (
                <>Record Expense</>
              ) : (
                <>Record Income</>
              )}
            </button>
            <Link to={backTo} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ExpenseForm = () => <TransactionForm kind="expense" />;
export const IncomeForm = () => <TransactionForm kind="income" />;

export default TransactionForm;
