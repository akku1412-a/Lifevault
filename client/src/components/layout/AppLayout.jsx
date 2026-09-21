import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Clock,
  Menu
} from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mobileNavItems = [
    { name: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/app/documents', icon: FileText },
    { name: 'Upload', path: '/app/upload', icon: PlusCircle },
    { name: 'Expiring', path: '/app/expiring', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] flex transition-colors duration-250">
      {/* Persistent Sidebar (Collapsible drawer on mobile) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Application Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#fbfbfd]/90 dark:bg-[#161617]/90 backdrop-blur-lg border-t border-[#e5e5ea] dark:border-[#262629] flex items-center justify-around px-2"
        aria-label="Mobile navigation"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`
              }
            >
              <Icon className="w-5 h-5 stroke-[2]" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          aria-label="More options"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
