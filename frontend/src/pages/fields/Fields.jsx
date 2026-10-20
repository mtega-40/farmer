import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fieldAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import { useFarms } from '../../hooks/useFarms';
import { useFarmScope } from '../../hooks/useFarmScope';
import { Wheat, Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, FarmPicker, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUS_TONE = {
  planted: 'green',
  growing: 'green',
  harvested: 'blue',
  fallow: 'gray',
};

const Fields = () => {
  const { farmId: routeFarmId } = useParams();
  const { farmId, farm, farms, farmsLoading, selectFarm } = useFarmScope();
  const { can } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  const effectiveFarmId = routeFarmId || farmId;

  const load = async () => {
    if (!effectiveFarmId) return;
    setLoading(true);
    try {
      const res = await fieldAPI.getAll(effectiveFarmId);
      setFields(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveFarmId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this field?')) return;
    try {
      await fieldAPI.delete(effectiveFarmId, id);
      toast.success('Field deleted');
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete field');
    }
  };

  if (farmsLoading && farms.length === 0) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Fields"
        subtitle={farm ? `Crop fields for ${farm.name}` : 'Select a farm to manage its fields'}
        actions={
          can('field', 'create') && effectiveFarmId ? (
            <button
              onClick={() => navigate(`/farms/${effectiveFarmId}/fields/new`)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Field
            </button>
          ) : null
        }
      />

      <div className="mb-6">
        <FarmPicker farms={farms} value={effectiveFarmId} onChange={selectFarm} />
      </div>

      {!effectiveFarmId ? (
        <EmptyState icon={Wheat} message="Select a farm to view its fields" />
      ) : loading ? (
        <Spinner />
      ) : fields.length === 0 ? (
        <EmptyState
          icon={Wheat}
          message="No fields yet"
          action={
            can('field', 'create') ? (
              <button
                onClick={() => navigate(`/farms/${effectiveFarmId}/fields/new`)}
                className="btn-primary"
              >
                Add first field
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div key={field.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                  <p className="text-sm text-gray-500">{field.crop_type || 'No crop'}</p>
                </div>
                <Wheat className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-1 text-sm mb-4">
                <p><span className="font-medium">Area:</span> {field.area_hectares || 0} ha</p>
                <p><span className="font-medium">Soil:</span> {field.soil_type || 'N/A'}</p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge tone={STATUS_TONE[field.status] || 'gray'}>{field.status || 'planted'}</Badge>
                </p>
                {field.planting_date && (
                  <p><span className="font-medium">Planted:</span> {new Date(field.planting_date).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex space-x-2">
                {can('field', 'update') && (
                  <Link
                    to={`/farms/${effectiveFarmId}/fields/${field.id}/edit`}
                    className="flex-1 btn-secondary text-sm flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                )}
                {can('field', 'delete') && (
                  <button
                    onClick={() => handleDelete(field.id)}
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

export default Fields;
