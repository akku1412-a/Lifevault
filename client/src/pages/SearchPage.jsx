import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { documentsApi } from '../services/api';
import DocumentCard from '../components/documents/DocumentCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  Search,
  Sparkles,
  Layers,
  FileText,
  Building2,
  X,
  ArrowRight
} from 'lucide-react';

const SUGGESTED_SEARCHES = [
  'Samsung warranty',
  'Health insurance',
  'Amazon receipt',
  'College certificate',
  'Driver license',
  'Utility bill'
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await documentsApi.search({ q: searchTerm.trim() });
      if (res.data.success) {
        setResults(res.data.data.documents || []);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        const params = new URLSearchParams();
        params.set('q', query.trim());
        setSearchParams(params, { replace: true });
        performSearch(query);
      } else {
        setResults([]);
        setSearchParams({}, { replace: true });
      }
    }, 280);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleDeleteConfirm = async () => {
    if (!deleteDoc) return;
    try {
      setIsDeleting(true);
      await documentsApi.delete(deleteDoc._id);
      setDeleteDoc(null);
      performSearch(query);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 animate-fadeIn">
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Search your documents.
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Find any record by issuer, tags, keywords, OCR text, or AI intelligence summaries.
        </p>

        {/* Large Signature Search Input */}
        <div className="relative max-w-2xl mx-auto pt-4">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents..."
            autoFocus
            className="w-full pl-14 pr-12 py-4 rounded-3xl bg-white dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] text-base text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-sm transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggested Quick Searches */}
        {!query && (
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-neutral-400 mr-1">Try searching:</span>
            {SUGGESTED_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          ))}
        </div>
      ) : query && results.length === 0 ? (
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-16 text-center border border-[#e5e5ea] dark:border-[#262629] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            No documents matched your search.
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Try searching with broader terms or check your spelling.
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <span>
              Found {results.length} {results.length === 1 ? 'match' : 'matches'} for "{query}"
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onDeleteClick={(d) => setDeleteDoc(d)}
              />
            ))}
          </div>
        </div>
      ) : null}

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
