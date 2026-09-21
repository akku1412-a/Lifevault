import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';
import {
  Bell,
  CheckCheck,
  Sparkles,
  AlertTriangle,
  Info,
  Trash2,
  ExternalLink
} from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'ai_completed':
        return <Sparkles className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />;
      case 'warning':
      case 'expiry':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            System updates, AI analysis reports, and document deadline notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e5ea] dark:border-[#262629] pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-16 text-center border border-[#e5e5ea] dark:border-[#262629] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            You will see alerts here when AI finishes analyzing your documents or when deadlines approach.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161617] rounded-3xl border border-[#e5e5ea] dark:border-[#262629] divide-y divide-[#e5e5ea] dark:divide-[#262629] overflow-hidden shadow-sm">
          {filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.isRead) markAsRead(n._id);
                if (n.actionUrl) navigate(n.actionUrl);
              }}
              className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                n.isRead
                  ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40 opacity-80'
                  : 'bg-neutral-50/70 dark:bg-[#1c1c1e]/60 hover:bg-neutral-100/70'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono pt-1">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n._id);
                }}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
                title="Dismiss"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
