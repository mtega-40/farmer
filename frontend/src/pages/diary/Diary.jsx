import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { diaryAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import { useFarmScope } from '../../hooks/useFarmScope';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, FarmPicker, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const CATEGORY_TONE = {
  observation: 'blue',
  planting: 'green',
  harvest: 'yellow',
  livestock: 'orange',
  maintenance: 'gray',
  weather: 'blue',
  general: 'gray',
};

const Diary = () => {
  const { farmId, farm, farms, farmsLoading, selectFarm } = useFarmScope();
  const { can } = useAuth();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  const load = async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const params = categoryFilter ? { category: categoryFilter } : {};
      const res = await diaryAPI.getAll(farmId, params);
      setEntries(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load diary entries');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, categoryFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diary entry?')) return;
    try {
      await diaryAPI.delete(farmId, id);
      toast.success('Entry deleted');
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete entry');
    }
  };

  if (farmsLoading && farms.length === 0) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Farm Diary"
        subtitle={farm ? `Daily records for ${farm.name}` : 'Select a farm to view its diary'}
        actions={
          can('diary', 'create') && farmId ? (
            <Link to={`/farms/${farmId}/diary/new`} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Entry
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-4 items-end mb-6">
        <FarmPicker farms={farms} value={farmId} onChange={selectFarm} />
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-field"
          >
            <option value="">All categories</option>
            {Object.keys(CATEGORY_TONE).map((c) => (
              <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {!farmId ? (
        <EmptyState icon={BookOpen} message="Select a farm to view its diary" />
      ) : loading ? (
        <Spinner />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          message="No diary entries yet"
          action={
            can('diary', 'create') ? (
              <Link to={`/farms/${farmId}/diary/new`} className="btn-primary">
                Write first entry
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                  <p className="text-xs text-gray-500">
                    {entry.user_name} • {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge tone={CATEGORY_TONE[entry.category] || 'gray'}>
                  {String(entry.category || 'general').replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              <div className="flex space-x-2 mt-4">
                {can('diary', 'update') && (
                  <Link
                    to={`/farms/${farmId}/diary/${entry.id}/edit`}
                    className="btn-secondary px-3 py-1 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                )}
                {can('diary', 'delete') && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Diary;
