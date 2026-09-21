import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Folder,
  Clock,
  Calendar,
  Search,
  Bell,
  Activity,
  Settings,
  Plus,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();

  const primaryNav = [
    { name: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/app/documents', icon: FileText },
    { name: 'Categories', path: '/app/categories', icon: Folder },
    { name: 'Expiring Soon', path: '/app/expiring', icon: Clock },
    { name: 'Reminders', path: '/app/reminders', icon: Calendar },
  ];

  const secondaryNav = [
    { name: 'Search', path: '/app/search', icon: Search },
    { name: 'Notifications', path: '/app/notifications', icon: Bell, badge: unreadCount },
    { name: 'Activity', path: '/app/activity', icon: Activity },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#f5f5f7] dark:bg-[#161617] border-r border-[#e5e5ea] dark:border-[#262629] flex flex-col transition-transform duration-250 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#e5e5ea] dark:border-[#262629]">
          <Link to="/app/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
            <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-white">
              LifeVault
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Upload CTA */}
        <div className="p-4 pb-2">
          <Link
            to="/app/upload"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Vault New Document</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Primary Nav */}
          <div className="space-y-0.5">
            <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-1.5">
              Vault
            </div>
            {primaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/40 dark:hover:bg-neutral-800/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 stroke-[2]" />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>

          {/* Secondary Nav */}
          <div className="space-y-0.5">
            <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-1.5">
              System
            </div>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/40 dark:hover:bg-neutral-800/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 stroke-[2]" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Account & Controls Footer */}
        <div className="p-3 border-t border-[#e5e5ea] dark:border-[#262629] space-y-2">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-neutral-200/40 dark:bg-neutral-800/40">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                {user?.name || 'Vault Member'}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {user?.email || ''}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
