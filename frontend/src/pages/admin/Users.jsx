import React, { useState } from 'react';
import { userAPI } from '../../api/index';
import { useAuth } from '../../contexts/AuthContext';
import { ALL_ROLES, PERMISSION_LABELS } from '../../config/permissions';
import { UsersIcon, Search, Trash2, Shield } from 'lucide-react';
import { PageHeader, EmptyState, Spinner, StatCard, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = async (filters = { role: roleFilter, search }) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.role) params.role = filters.role;
      if (filters.search) params.search = filters.search;
      const [usersRes, statsRes] = await Promise.all([
        userAPI.getAll(params),
        userAPI.getStats(),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await userAPI.updateRole(userId, role);
      toast.success('Role updated');
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await userAPI.delete(userId);
      toast.success('User deleted');
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle="Admin only: manage accounts and roles across the system" />

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard label="Total Users" value={stats.total_users} icon={UsersIcon} color="bg-green-500" />
          <StatCard label="Farms" value={stats.total_farms} icon={Shield} color="bg-emerald-500" />
          <StatCard label="Open Tasks" value={stats.open_tasks} color="bg-yellow-500" />
          <StatCard
            label="Net Income"
            value={`$${Number(stats.total_income - stats.total_expenses).toLocaleString()}`}
            color="bg-blue-500"
          />
        </div>
      )}

      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
                placeholder="Name or email"
                className="input-field pl-9"
              />
            </div>
          </div>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="select-field"
            >
              <option value="">All roles</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{PERMISSION_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <button onClick={() => load()} className="btn-primary">Search</button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} message="No users match your filters" />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Role', 'Farms Owned', 'Farms Working', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((u) => {
                const isSelf = String(u.id) === String(currentUser?.id);
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isSelf ? (
                        <Badge tone="blue">{PERMISSION_LABELS[u.role] || u.role}</Badge>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="select-field"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>{PERMISSION_LABELS[r]}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.farms_owned}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.farms_working}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {!isSelf && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
