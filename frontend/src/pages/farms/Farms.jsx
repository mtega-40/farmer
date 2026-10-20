import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import { useFarms } from '../../hooks/useFarms';
import { Sprout, Plus, Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, StatCard } from '../../components/ui';
import toast from 'react-hot-toast';

const Farms = () => {
  const { farms, loading, reload } = useFarms();
  const { can } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = farms.filter((farm) =>
    `${farm.name} ${farm.location || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  const totalArea = farms.reduce((sum, f) => sum + Number(f.area_hectares || 0), 0);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) return;
    try {
      await farmAPI.delete(id);
      toast.success('Farm deleted');
      reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete farm');
    }
  };

  if (loading && farms.length === 0) return <Spinner />;

  const canCreate = can('farm', 'create');

  return (
    <div>
      <PageHeader
        title="Farms"
        subtitle="Manage all farms you own or work on"
        actions={
          canCreate ? (
            <button onClick={() => navigate('/farms/new')} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Farm
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <StatCard label="Total Farms" value={farms.length} icon={Sprout} color="bg-green-500" />
        <StatCard label="Total Area" value={`${totalArea.toFixed(2)} ha`} icon={MapPin} color="bg-emerald-500" />
      </div>

      {farms.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search farms by name or location"
            className="input-field max-w-md"
          />
        </div>
      )}

      {farms.length === 0 ? (
        <EmptyState
          icon={Sprout}
          message="No farms yet"
          action={
            canCreate ? (
              <button onClick={() => navigate('/farms/new')} className="btn-primary">
                Create your first farm
              </button>
            ) : null
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Sprout} message="No farms match your search" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((farm) => (
            <div key={farm.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{farm.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {farm.location || 'No location'}
                  </p>
                </div>
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-green-600">{farm.area_hectares || 0}</span>
                <span className="text-gray-500 text-sm"> hectares</span>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/farms/${farm.id}`}
                  className="flex-1 btn-secondary text-center flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
                {can('farm', 'update') && (
                  <button onClick={() => navigate(`/farms/${farm.id}/edit`)} className="btn-secondary flex items-center px-3">
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                {can('farm', 'delete') && (
                  <button
                    onClick={() => handleDelete(farm.id)}
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

export default Farms;
