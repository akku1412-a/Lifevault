import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { documentsApi } from '../services/api';
import DocumentCard from '../components/documents/DocumentCard';
import DocumentTable from '../components/documents/DocumentTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  X
} from 'lucide-react';

const CATEGORY_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Identity', value: 'identity' },
  { label: 'Education', value: 'education' },
  { label: 'Certificates', value: 'certificates' },
  { label: 'Finance', value: 'finance' },
  { label: 'Bills', value: 'bills' },
  { label: 'Receipts', value: 'receipts' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Warranty', value: 'warranty' },
  { label: 'Medical', value: 'medical' },
  { label: 'Employment', value: 'employment' },
  { label: 'Legal', value: 'legal' },
  { label: 'Travel', value: 'travel' },
  { label: 'Other', value: 'other' }
];

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sortBy') || 'newest';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [viewMode, setViewMode] = useState('grid');
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [deleteDoc, setDeleteDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: viewMode === 'grid' ? 12 : 20,
        category: category !== 'all' ? category : undefined,
        search: search.trim() || undefined,
        sortBy
      };

      const res = await documentsApi.getAll(params);
      if (res.data.success) {
        setDocuments(res.data.data.documents || []);
        setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, viewMode, category, search, sortBy]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Sync with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (search.trim()) params.set('search', search.trim());
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    if (page > 1) params.set('page', page);
    setSearchParams(params, { replace: true });
  }, [category, search, sortBy, page, setSearchParams]);

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    try {
      setIsDeleting(true);
      await documentsApi.delete(deleteDoc._id);
      setDeleteDoc(null);
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Your documents
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {pagination.total} {pagination.total === 1 ? 'record vaulted' : 'records vaulted in encrypted storage'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-neutral-100 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="List View"
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/upload')}
            className="px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Vault New</span>
          </button>
        </div>
      </div>

      {/* Large Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search your documents by name, issuer, tag, or extracted text..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all shadow-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setCategory(f.value);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              category === f.value
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'bg-white dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Documents Grid / Table View */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-16 text-center border border-[#e5e5ea] dark:border-[#262629] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {search || category !== 'all'
                ? 'No documents matched your search.'
                : "You haven't added any documents yet."}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {search || category !== 'all'
                ? 'Try adjusting your search query or selecting a different category filter.'
                : 'Vault your passports, warranties, insurance, or certificates.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (search || category !== 'all') {
                setSearch('');
                setCategory('all');
              } else {
                navigate('/app/upload');
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs shadow-sm hover:scale-105 transition-transform"
          >
            {search || category !== 'all' ? 'Reset Filters' : 'Add your first document'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDeleteClick={(d) => setDeleteDoc(d)}
            />
          ))}
        </div>
      ) : (
        <DocumentTable
          documents={documents}
          onDeleteClick={(d) => setDeleteDoc(d)}
        />
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="pt-4 flex items-center justify-between border-t border-[#e5e5ea] dark:border-[#262629] text-xs text-neutral-500">
          <span>
            Showing page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-[#e5e5ea] dark:border-[#262629] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="p-2 rounded-xl border border-[#e5e5ea] dark:border-[#262629] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDoc && (
        <ConfirmDialog
          isOpen={Boolean(deleteDoc)}
          onClose={() => setDeleteDoc(null)}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
          title="Delete Document"
          message={`Are you sure you want to permanently delete "${deleteDoc.title}"? This cannot be undone.`}
        />
      )}
    </div>
  );
}
