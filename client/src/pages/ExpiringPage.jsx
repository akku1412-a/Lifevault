import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '../services/api';
import DocumentCard from '../components/documents/DocumentCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  XCircle,
  FileText,
  Plus
} from 'lucide-react';

export default function ExpiringPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpiring = async () => {
    try {
      setIsLoading(true);
      const res = await documentsApi.getExpiring();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load expiring documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiring();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    try {
      setIsDeleting(true);
      await documentsApi.delete(deleteDoc._id);
      setDeleteDoc(null);
      fetchExpiring();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 py-8 animate-fadeIn">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-44 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          <div className="h-44 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          <div className="h-44 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
        </div>
      </div>
    );
  }

  const expired = data?.expired || [];
  const in7Days = data?.in7Days || [];
  const in30Days = data?.in30Days || [];
  const allTracked = data?.allWithExpiry || [];
  const totalDeadlines = expired.length + in7Days.length + in30Days.length;

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4 animate-fadeIn">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Expiring soon
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {totalDeadlines === 0
              ? 'All vaulted warranties, IDs, and policies are currently active and up to date.'
              : `${totalDeadlines} upcoming ${totalDeadlines === 1 ? 'deadline requires' : 'deadlines require'} attention.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/upload')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Vault Document</span>
        </button>
      </div>

      {totalDeadlines === 0 && allTracked.length === 0 ? (
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-16 text-center border border-[#e5e5ea] dark:border-[#262629] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 stroke-[1.8] text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              No expiring documents
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              When documents with expiry dates (warranties, certificates, licenses) are vaulted, LifeVault will track them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Expiring within 7 Days (Urgent) */}
          {in7Days.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                  Expiring within 7 days ({in7Days.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {in7Days.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onDeleteClick={(d) => setDeleteDoc(d)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 2: Expiring within 30 Days */}
          {in30Days.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                  Expiring within 30 days ({in30Days.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {in30Days.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onDeleteClick={(d) => setDeleteDoc(d)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Expired */}
          {expired.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                  Expired ({expired.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {expired.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onDeleteClick={(d) => setDeleteDoc(d)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 4: All Tracked Documents with Expiry Dates */}
          {allTracked.length > 0 && totalDeadlines === 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                  All Active Tracked Documents ({allTracked.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTracked.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onDeleteClick={(d) => setDeleteDoc(d)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteDoc && (
        <ConfirmDialog
          isOpen={Boolean(deleteDoc)}
          onClose={() => setDeleteDoc(null)}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
          title="Delete Document"
          message={`Are you sure you want to delete "${deleteDoc.title}"?`}
        />
      )}
    </div>
  );
}
