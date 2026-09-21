import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import { formatBytes } from '../utils/formatters';
import {
  User,
  Lock,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    try {
      setIsUpdatingProfile(true);
      const res = await authApi.updateProfile({ name: name.trim() });
      if (res.data.success) {
        updateUser({ name: res.data.data.user.name });
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await authApi.updateProfile({
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const usageBytes = user?.storageUsage || 0;
  const quotaBytes = user?.storageQuota || 1073741824;
  const usagePct = Math.min(100, Math.round((usageBytes / quotaBytes) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your account profile, security credentials, storage quota, and preferences.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 border border-[#e5e5ea] dark:border-[#262629] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Personal Information
              </h2>
              <p className="text-xs text-neutral-400">
                Your personal vault identity details
              </p>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile name updated successfully.</span>
            </div>
          )}
          {profileError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateName} className="space-y-4 max-w-md text-xs">
            <div className="space-y-1">
              <label className="font-medium text-neutral-600 dark:text-neutral-400">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-neutral-600 dark:text-neutral-400">Email Address (Immutable)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-neutral-500 text-sm cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-5 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving...' : 'Update Name'}
            </button>
          </form>
        </div>

        {/* Security & Password Card */}
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 border border-[#e5e5ea] dark:border-[#262629] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Lock className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Password & Security
              </h2>
              <p className="text-xs text-neutral-400">
                Update password with bcrypt encryption
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Password updated successfully.</span>
            </div>
          )}
          {passwordError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
            <div className="space-y-1">
              <label className="font-medium text-neutral-600 dark:text-neutral-400">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-neutral-600 dark:text-neutral-400">New Password (at least 6 characters)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-neutral-600 dark:text-neutral-400">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isChangingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Vault Storage Quota Card */}
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 border border-[#e5e5ea] dark:border-[#262629] shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <HardDrive className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Encrypted Storage Quota
              </h2>
              <p className="text-xs text-neutral-400">
                Disk usage for your uploaded documents and attachments
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-300 font-medium">
              <span>{formatBytes(usageBytes)} used</span>
              <span>{formatBytes(quotaBytes)} total</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-neutral-900 dark:bg-white transition-all duration-500"
                style={{ width: `${Math.max(2, usagePct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Theme Preferences Card */}
        <div className="bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 border border-[#e5e5ea] dark:border-[#262629] shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              Interface Appearance
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Switch between Apple Light and Dark modes.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
