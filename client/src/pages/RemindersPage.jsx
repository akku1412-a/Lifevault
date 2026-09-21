import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { remindersApi, documentsApi } from '../services/api';
import { formatDate, getDaysUntil } from '../utils/formatters';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  ArrowRight,
  X
} from 'lucide-react';

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Reminder Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      const res = await remindersApi.getAll();
      if (res.data.success) {
        setReminders(res.data.data.reminders || []);
      }
    } catch (err) {
      console.error('Failed to load reminders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDocs = async () => {
    try {
      const res = await documentsApi.getAll({ limit: 100 });
      if (res.data.success) {
        setDocuments(res.data.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents for reminder modal', err);
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchUserDocs();
  }, []);

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!selectedDocId || !reminderDate) return;

    try {
      setIsSubmitting(true);
      const res = await remindersApi.create({
        documentId: selectedDocId,
        reminderDate: new Date(reminderDate),
        notes: notes.trim()
      });
      if (res.data.success) {
        setIsModalOpen(false);
        setSelectedDocId('');
        setReminderDate('');
        setNotes('');
        fetchReminders();
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await remindersApi.delete(id);
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to remove reminder');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Reminders
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Scheduled notifications and renewal alerts for your vaulted documents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Reminders List */}
      {isLoading ? (
        <div className="space-y-3 animate-fadeIn">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-16 text-center border border-[#e5e5ea] dark:border-[#262629] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              No reminders scheduled
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Schedule alerts for document renewals, warranty expiration, or payment due dates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs shadow-sm hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create reminder</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161617] rounded-3xl border border-[#e5e5ea] dark:border-[#262629] divide-y divide-[#e5e5ea] dark:divide-[#262629] overflow-hidden shadow-sm">
          {reminders.map((rem) => {
            const doc = rem.documentId;
            const days = getDaysUntil(rem.reminderDate);

            return (
              <div
                key={rem._id}
                className="p-5 flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                        {rem.title}
                      </p>
                      {days <= 7 && days >= 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                          In {days} days
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {doc ? (
                        <Link
                          to={`/app/documents/${doc._id}`}
                          className="hover:underline text-neutral-600 dark:text-neutral-400"
                        >
                          Document: {doc.title}
                        </Link>
                      ) : (
                        'General Reminder'
                      )}
                      {rem.notes && ` • "${rem.notes}"`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs">
                  <span className="font-mono text-neutral-500">
                    {formatDate(rem.reminderDate)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(rem._id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Remove Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e5e5ea] dark:border-[#262629] shadow-xl space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Schedule Reminder
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-neutral-600 dark:text-neutral-400">
                  Select Document
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
                >
                  <option value="">Choose a vaulted document...</option>
                  {documents.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.title} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-600 dark:text-neutral-400">
                  Reminder Date
                </label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-600 dark:text-neutral-400">
                  Personal Notes
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call insurer to renew policy"
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
