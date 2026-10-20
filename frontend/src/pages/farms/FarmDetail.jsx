import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { farmAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import {
  Wheat, Beef, Package, Users, DollarSign, ClipboardList,
  ArrowLeft, Edit, Trash2, MapPin, BookOpen, Clock,
} from 'lucide-react';
import { PageHeader, Spinner, ErrorState } from '../../components/ui';
import toast from 'react-hot-toast';

const SECTIONS = [
  { key: 'fields', label: 'Fields', to: 'fields', icon: Wheat, permission: 'field:read' },
  { key: 'livestock', label: 'Livestock', to: 'livestock', icon: Beef, permission: 'livestock:read' },
  { key: 'inventory', label: 'Inventory', to: 'inventory', icon: Package, permission: 'inventory:read' },
  { key: 'workers', label: 'Workers', to: 'workers', icon: Users, permission: 'worker:read' },
  { key: 'finance', label: 'Finance', to: 'finance', icon: DollarSign, permission: 'finance:read' },
  { key: 'tasks', label: 'Tasks', to: 'tasks', icon: ClipboardList, permission: 'task:read' },
  { key: 'diary', label: 'Diary', to: 'diary', icon: BookOpen, permission: 'diary:read' },
  { key: 'activity', label: 'Activity Log', to: 'activity-log', icon: Clock, permission: 'activityLog:read' },
];

const FarmDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await farmAPI.get(id);
      setFarm(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Farm not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this farm and all of its records?')) return;
    try {
      await farmAPI.delete(id);
      toast.success('Farm deleted');
      navigate('/farms');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete farm');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const sections = SECTIONS.filter((s) => can(s.permission.split(':')[0], s.permission.split(':')[1]));

  return (
    <div>
      <Link to="/farms" className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Farms
      </Link>

      <PageHeader
        title={farm.name}
        subtitle={farm.location || 'No location set'}
        actions={
          <>
            {can('farm', 'update') && (
              <Link to={`/farms/${id}/edit`} className="btn-secondary flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            )}
            {can('farm', 'delete') && (
              <button onClick={handleDelete} className="btn-secondary flex items-center text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500">Area</p>
          <p className="text-2xl font-bold text-gray-900">{farm.area_hectares || 0} ha</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Location</p>
          <p className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {farm.location || 'N/A'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Created</p>
          <p className="text-lg font-semibold text-gray-900">
            {farm.created_at ? new Date(farm.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Sections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.key}
              to={`/farms/${id}/${section.to}`}
              className="card hover:border-green-400 transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-green-100 rounded-md p-3">
                  <Icon className="h-6 w-6 text-green-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{section.label}</h3>
                  <p className="text-sm text-gray-500">Manage {section.label.toLowerCase()}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FarmDetail;
