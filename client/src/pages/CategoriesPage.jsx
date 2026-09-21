import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '../services/api';
import {
  Folder,
  Plus,
  ArrowRight,
  Shield,
  GraduationCap,
  Award,
  Landmark,
  Receipt,
  ShoppingBag,
  HeartPulse,
  FileCheck,
  Activity,
  Briefcase,
  Scale,
  Plane,
  Trash2,
  X
} from 'lucide-react';

const ICON_MAP = {
  Shield,
  GraduationCap,
  Award,
  Landmark,
  Receipt,
  ShoppingBag,
  HeartPulse,
  FileCheck,
  Activity,
  Briefcase,
  Scale,
  Plane,
  Folder
};

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Category Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await categoriesApi.getAll();
      if (res.data.success) {
        setCategories(res.data.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCreateError(null);
    if (!newCatName.trim()) return;

    try {
      setIsCreating(true);
      const res = await categoriesApi.create({
        name: newCatName.trim()
      });
      if (res.data.success) {
        setIsModalOpen(false);
        setNewCatName('');
        fetchCategories();
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Categories
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Organize personal documents by domain. LifeVault Intelligence categorizes files automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-neutral-100 dark:bg-[#161617] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Folder;
            return (
              <div
                key={cat.id || cat.slug}
                onClick={() => navigate(`/app/documents?category=${cat.slug}`)}
                className="group bg-white dark:bg-[#161617] p-5 rounded-3xl border border-[#e5e5ea] dark:border-[#262629] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer flex flex-col justify-between shadow-sm space-y-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 stroke-[1.8]" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white capitalize group-hover:underline">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {cat.documentCount} {cat.documentCount === 1 ? 'document' : 'documents'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-[#e5e5ea] dark:border-[#262629] shadow-xl space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Create Category
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <p className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl">
                {createError}
              </p>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-neutral-600 dark:text-neutral-400">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Pet Records, Real Estate"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
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
                  disabled={isCreating}
                  className="px-5 py-2 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium transition-all shadow-sm disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
