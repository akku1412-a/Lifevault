import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { documentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  FileText,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Folder,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, expiringRes] = await Promise.all([
        documentsApi.getStats(),
        documentsApi.getExpiring()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (expiringRes.data.success) {
        const in7 = expiringRes.data.data.in7Days || [];
        const in30 = expiringRes.data.data.in30Days || [];
        const exp = expiringRes.data.data.expired || [];
        setExpiringDocs([...exp, ...in7, ...in30].slice(0, 4));
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard overview');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-8 animate-fadeIn">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
          <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-850 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-40 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          <div className="h-40 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          <div className="h-40 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
        </div>
      </div>
    );
  }

  const totalCount = stats?.totalDocuments || 0;
  const recentDocs = stats?.recentDocuments || [];
  const categoriesMap = stats?.categoryBreakdown || {};
  const categoriesList = Object.entries(categoriesMap);

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4 animate-fadeIn">
      {/* Editorial Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-base text-neutral-500 dark:text-neutral-400 font-normal">
            Your documents are under control.
          </p>
        </div>

        <Link
          to="/app/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-sm shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Vault Document</span>
        </Link>
      </div>

      {/* Large Typography Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Documents Section */}
        <div className="bg-white dark:bg-[#161617] p-8 rounded-3xl border border-[#e5e5ea] dark:border-[#262629] space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Vaulted
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {totalCount}
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              {totalCount === 1 ? 'Document' : 'Documents'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 pt-1">
            Organized across {categoriesList.length} active {categoriesList.length === 1 ? 'category' : 'categories'}
          </p>
        </div>

        {/* Attention / Expiring Section */}
        <div className="bg-white dark:bg-[#161617] p-8 rounded-3xl border border-[#e5e5ea] dark:border-[#262629] space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Needs Attention
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-5xl font-semibold tracking-tight ${
                expiringDocs.length > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-neutral-900 dark:text-white'
              }`}
            >
              {expiringDocs.length}
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              {expiringDocs.length === 1 ? 'Deadline' : 'Deadlines'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 pt-1">
            {expiringDocs.length > 0 ? 'Expiring in next 30 days' : 'No upcoming expirations'}
          </p>
        </div>

        {/* Vault Storage Usage */}
        <div className="bg-white dark:bg-[#161617] p-8 rounded-3xl border border-[#e5e5ea] dark:border-[#262629] space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Encrypted Storage
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {formatBytes(stats?.storageUsage || 0)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 pt-1">
            of {formatBytes(stats?.storageQuota || 1073741824)} allocated quota
          </p>
        </div>
      </div>

      {/* Section: Needs Your Attention (Expiring Soon) */}
      {expiringDocs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Needs your attention
              </h2>
            </div>
            <Link
              to="/app/expiring"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View all deadlines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expiringDocs.map((doc) => (
              <Link
                key={doc._id}
                to={`/app/documents/${doc._id}`}
                className="bg-white dark:bg-[#161617] p-5 rounded-3xl border border-[#e5e5ea] dark:border-[#262629] hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate group-hover:underline">
                      {doc.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                      {doc.category} • Expiry: {formatDate(doc.expiryDate)}
                    </p>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium shrink-0">
                  {doc.expiryStatus === 'expired' ? 'Expired' : 'Expiring Soon'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section: Recently Added Documents */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Recently Added
          </h2>
          <Link
            to="/app/documents"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View document library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="bg-white dark:bg-[#161617] rounded-3xl p-12 text-center border border-[#e5e5ea] dark:border-[#262629] space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                You haven't added any documents yet.
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Securely store warranties, identification, certificates, and policies.
              </p>
            </div>
            <Link
              to="/app/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs shadow-sm hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add your first document</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161617] rounded-3xl border border-[#e5e5ea] dark:border-[#262629] divide-y divide-[#e5e5ea] dark:divide-[#262629] overflow-hidden">
            {recentDocs.map((doc) => (
              <Link
                key={doc._id}
                to={`/app/documents/${doc._id}`}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate group-hover:underline">
                      {doc.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      <span className="capitalize">{doc.category}</span>
                      {doc.issuer && ` • ${doc.issuer}`}
                      {` • Added ${formatDate(doc.createdAt)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {doc.aiSummary && (
                    <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                      <Sparkles className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
                      <span>AI Analyzed</span>
                    </span>
                  )}
                  <span className="text-xs font-mono uppercase text-neutral-400 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                    {doc.mimeType?.includes('pdf') ? 'PDF' : 'IMAGE'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Section: Categories Overview */}
      {categoriesList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Categories
            </h2>
            <Link
              to="/app/categories"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Manage categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categoriesList.map(([catSlug, count]) => (
              <Link
                key={catSlug}
                to={`/app/documents?category=${catSlug}`}
                className="bg-white dark:bg-[#161617] p-5 rounded-3xl border border-[#e5e5ea] dark:border-[#262629] hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                  <Folder className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white capitalize group-hover:underline">
                    {catSlug}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {count} {count === 1 ? 'document' : 'documents'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
