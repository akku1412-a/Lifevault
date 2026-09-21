import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

export default function TopNav({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();

  // Determine current section title based on pathname
  const path = location.pathname;
  let sectionTitle = 'Vault';
  if (path.includes('/documents/')) sectionTitle = 'Document Details';
  else if (path.includes('/documents')) sectionTitle = 'Documents';
  else if (path.includes('/upload')) sectionTitle = 'Vault Document';
  else if (path.includes('/categories')) sectionTitle = 'Categories';
  else if (path.includes('/expiring')) sectionTitle = 'Expiring Soon';
  else if (path.includes('/reminders')) sectionTitle = 'Reminders';
  else if (path.includes('/search')) sectionTitle = 'Search';
  else if (path.includes('/notifications')) sectionTitle = 'Notifications';
  else if (path.includes('/activity')) sectionTitle = 'Audit Activity';
  else if (path.includes('/settings')) sectionTitle = 'Settings';
  else if (path.includes('/dashboard')) sectionTitle = 'Overview';

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#fbfbfd]/80 dark:bg-[#000000]/80 backdrop-blur-md border-b border-[#e5e5ea] dark:border-[#262629] px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu & Current Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
          {sectionTitle}
        </span>
      </div>

      {/* Right: Quick Search, New Document CTA, Notifications, Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate('/app/search')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-[#1c1c1e] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 border border-neutral-200/60 dark:border-neutral-800 text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search documents...</span>
          <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
            ⌘K
          </kbd>
        </button>

        <Link
          to="/app/notifications"
          className="relative p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neutral-900 dark:bg-white" />
          )}
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        <Link
          to="/app/upload"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Upload</span>
        </Link>
      </div>
    </header>
  );
}
