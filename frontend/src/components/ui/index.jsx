import React from 'react';

export const Spinner = ({ className = '' }) => (
  <div className={`flex items-center justify-center h-64 ${className}`}>
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const EmptyState = ({ icon: Icon, message, action }) => (
  <div className="card text-center py-12">
    {Icon && <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
    <p className="text-gray-500 mb-4">{message}</p>
    {action}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="card text-center py-12">
    <p className="text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary">
        Try again
      </button>
    )}
  </div>
);

export const FarmPicker = ({ farms, value, onChange, label = 'Select Farm', className = 'max-w-xs' }) => {
  if (!farms || farms.length === 0) return null;
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="select-field"
      >
        <option value="">Select a farm</option>
        {farms.map((farm) => (
          <option key={farm.id} value={farm.id}>
            {farm.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export const StatCard = ({ label, value, icon: Icon, color = 'bg-green-500' }) => (
  <div className="card">
    <div className="flex items-center">
      {Icon && (
        <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      )}
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
          <dd className="text-2xl font-bold text-gray-900">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
);

export const Badge = ({ children, tone = 'gray' }) => {
  const tones = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    blue: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
};

export const DeleteButton = ({ onClick, label = 'Delete' }) => (
  <button
    onClick={onClick}
    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center"
    title={label}
  >
    {label}
  </button>
);

export default {
  Spinner,
  PageHeader,
  EmptyState,
  ErrorState,
  FarmPicker,
  StatCard,
  Badge,
  DeleteButton,
};
