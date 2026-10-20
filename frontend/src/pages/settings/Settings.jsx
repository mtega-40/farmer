import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/index';
import { PERMISSION_LABELS } from '../../config/permissions';
import { User, KeyRound, Shield } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setProfileSaving(true);
    try {
      await updateProfile({ name: profile.name.trim(), phone: profile.phone.trim() });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!password.current_password) errors.current_password = 'Current password is required';
    if (password.new_password.length < 6) errors.new_password = 'New password must be at least 6 characters';
    if (password.new_password !== password.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPasswordSaving(true);
    try {
      await authAPI.updateProfile({ password: password.new_password });
      toast.success('Password changed');
      setPassword({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your account" />

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" value={user?.email || ''} disabled className="input-field bg-gray-100" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="flex items-center h-10 px-3 bg-gray-100 border border-gray-300 rounded-lg">
                  <Shield className="h-4 w-4 text-gray-500 mr-2" />
                  {PERMISSION_LABELS[user?.role] || user?.role}
                </div>
                <p className="text-xs text-gray-500 mt-1">Only an administrator can change your role.</p>
              </div>
            </div>
            <button type="submit" disabled={profileSaving} className="btn-primary">
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <KeyRound className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                name="current_password"
                value={password.current_password}
                onChange={handlePasswordChange}
                className="input-field"
              />
              {passwordErrors.current_password && (
                <p className="text-sm text-red-600 mt-1">{passwordErrors.current_password}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={password.new_password}
                  onChange={handlePasswordChange}
                  className="input-field"
                />
                {passwordErrors.new_password && (
                  <p className="text-sm text-red-600 mt-1">{passwordErrors.new_password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={password.confirm_password}
                  onChange={handlePasswordChange}
                  className="input-field"
                />
                {passwordErrors.confirm_password && (
                  <p className="text-sm text-red-600 mt-1">{passwordErrors.confirm_password}</p>
                )}
              </div>
            </div>
            <button type="submit" disabled={passwordSaving} className="btn-primary">
              {passwordSaving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
