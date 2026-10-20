import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from './ui';

const Forbidden = () => (
  <div className="card text-center py-16">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access denied</h2>
    <p className="text-gray-600">Your role does not have permission to view this page.</p>
  </div>
);

export const ProtectedRoute = ({ children, permission, roles }) => {
  const { isAuthenticated, loading, can, role } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Forbidden />;
  }

  if (permission) {
    const [resource, action] = permission.split(':');
    if (!can(resource, action)) {
      return <Forbidden />;
    }
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner />;

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default ProtectedRoute;
