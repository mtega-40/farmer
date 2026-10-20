import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSION_LABELS } from '../config/permissions';
import LanguageSwitcher from './LanguageSwitcher';
import {
  LogOut, Home, Sprout, Beef, Package, Users, DollarSign,
  ClipboardList, Clock, Settings as SettingsIcon, Menu, X, Wheat,
  BookOpen, Shield,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [{ name: 'Dashboard', href: '/', icon: Home, end: true }],
  },
  {
    title: 'Farm',
    items: [
      { name: 'Farms', href: '/farms', icon: Sprout, permission: 'farm:read' },
      { name: 'Fields', href: '/fields', icon: Wheat, permission: 'field:read' },
      { name: 'Livestock', href: '/livestock', icon: Beef, permission: 'livestock:read' },
      { name: 'Diary', href: '/diary', icon: BookOpen, permission: 'diary:read' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Inventory', href: '/inventory', icon: Package, permission: 'inventory:read' },
      { name: 'Workers', href: '/workers', icon: Users, permission: 'worker:read' },
      { name: 'Finance', href: '/finance', icon: DollarSign, permission: 'finance:read' },
      { name: 'Tasks', href: '/tasks', icon: ClipboardList, permission: 'task:read' },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Activity Log', href: '/activity-log', icon: Clock, permission: 'activityLog:read' },
      { name: 'User Management', href: '/admin/users', icon: Shield, permission: 'user:read' },
      { name: 'Settings', href: '/settings', icon: SettingsIcon },
    ],
  },
];

const Layout = () => {
  const { user, logout, can } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!item.permission) return true;
      const [resource, action] = item.permission.split(':');
      return can(resource, action);
    }),
  })).filter((section) => section.items.length > 0);

  const renderNav = (mobile = false) =>
    sections.map((section) => (
      <div key={section.title} className="mb-4">
        <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {section.title}
        </p>
        {section.items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={() => mobile && setSidebarOpen(false)}
              className={({ isActive: active }) =>
                `${mobile
                  ? 'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                  : 'group flex items-center px-2 py-2 text-sm font-medium rounded-md'} ${
                  active ? 'bg-green-100 text-green-900' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className={mobile ? 'mr-4 h-6 w-6' : 'mr-3 h-6 w-6'} />
              {item.name}
            </NavLink>
          );
        })}
      </div>
    ));

  const userFooter = (
    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
      <div className="flex items-center w-full">
        <div className="flex-1">
          <div className="text-base font-medium text-gray-800">{user?.name}</div>
          <div className="text-xs font-medium text-gray-500">
            {PERMISSION_LABELS[user?.role] || user?.role}
          </div>
        </div>
        <button onClick={logout} className="ml-3 text-gray-400 hover:text-gray-500" title="Logout">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div
          className="fixed inset-0 flex z-40 md:hidden"
          style={{ display: sidebarOpen ? 'block' : 'none' }}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white overflow-y-auto">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Sprout className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">FarmManager</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">{renderNav(true)}</nav>
            </div>
            {userFooter}
          </div>
        </div>

        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Sprout className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">FarmManager</span>
              </div>
              <nav className="flex-1 mt-5 px-2 space-y-1">{renderNav(false)}</nav>
            </div>
            {userFooter}
          </div>
        </div>

        <div className="md:pl-64 flex flex-col flex-1 w-full">
          <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-900">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-white hover:bg-gray-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-end mb-4">
                  <LanguageSwitcher />
                </div>
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
