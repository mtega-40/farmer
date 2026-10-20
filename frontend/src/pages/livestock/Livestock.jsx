import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { livestockAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import { useFarmScope } from '../../hooks/useFarmScope';
import { Beef, Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, FarmPicker, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const HEALTH_TONE = {
  healthy: 'green',
  sick: 'red',
  recovering: 'yellow',
  under_treatment: 'orange',
};

const Livestock = () => {
  const { farmId, farm, farms, farmsLoading, selectFarm } = useFarmScope();
  const { can } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [healthFilter, setHealthFilter] = useState('all');

  const load = async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const res = await livestockAPI.getAll(farmId);
      setAnimals(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load livestock');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this animal record?')) return;
    try {
      await livestockAPI.delete(farmId, id);
      toast.success('Animal deleted');
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  if (farmsLoading && farms.length === 0) return <Spinner />;

  const filtered =
    healthFilter === 'all' ? animals : animals.filter((a) => a.health_status === healthFilter);

  return (
    <div>
      <PageHeader
        title="Livestock"
        subtitle={farm ? `Animals at ${farm.name}` : 'Select a farm to manage its animals'}
        actions={
          can('livestock', 'create') && farmId ? (
            <Link to={`/farms/${farmId}/livestock/new`} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Animal
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <FarmPicker farms={farms} value={farmId} onChange={selectFarm} />
        {animals.length > 0 && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">Health Filter</label>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="select-field"
            >
              <option value="all">All statuses</option>
              <option value="healthy">Healthy</option>
              <option value="sick">Sick</option>
              <option value="recovering">Recovering</option>
              <option value="under_treatment">Under treatment</option>
            </select>
          </div>
        )}
      </div>

      {!farmId ? (
        <EmptyState icon={Beef} message="Select a farm to view its livestock" />
      ) : loading ? (
        <Spinner />
      ) : animals.length === 0 ? (
        <EmptyState
          icon={Beef}
          message="No livestock yet"
          action={
            can('livestock', 'create') ? (
              <Link to={`/farms/${farmId}/livestock/new`} className="btn-primary">
                Add first animal
              </Link>
            ) : null
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Beef} message="No animals match this health filter" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((animal) => (
            <div key={animal.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">{animal.species}</h3>
                  <p className="text-sm text-gray-500">Tag: {animal.tag_number}</p>
                </div>
                <Beef className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Breed:</span> {animal.breed || 'N/A'}</p>
                <p><span className="font-medium">Age:</span> {animal.age_months || 0} months</p>
                <p><span className="font-medium">Weight:</span> {animal.weight_kg || 0} kg</p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge tone={HEALTH_TONE[animal.health_status] || 'gray'}>
                    {String(animal.health_status || '').replace(/_/g, ' ')}
                  </Badge>
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
                {can('livestock', 'update') && (
                  <Link
                    to={`/farms/${farmId}/livestock/${animal.id}/edit`}
                    className="flex-1 btn-secondary text-sm flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                )}
                {can('livestock', 'delete') && (
                  <button
                    onClick={() => handleDelete(animal.id)}
                    className="bg-red-500 text-white px-3 rounded hover:bg-red-600 flex items-center"
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

export default Livestock;
