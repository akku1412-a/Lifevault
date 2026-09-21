import axios from 'axios';

// ============================================================
// API BASE URL
// ============================================================
// In production (Vercel), set:
// VITE_API_URL=https://lifevault-2.onrender.com/api
//
// Locally, if VITE_API_URL is not set, requests use /api.
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// ============================================================
// AUTH TOKEN INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifevault_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Network error occurred',

      code:
        error.response?.data?.code ||
        'NETWORK_ERROR',

      status:
        error.response?.status ||
        500,

      data:
        error.response?.data
    };

    return Promise.reject(customError);
  }
);

// ============================================================
// HELPER FOR DIRECT FILE URLS
// ============================================================
// Axios automatically uses baseURL, but preview/download are
// opened directly by the browser, so we must explicitly use
// the backend URL here.
// ============================================================

const getFileBaseUrl = () => {
  return API_BASE_URL.replace(/\/+$/, '');
};

const buildFileUrl = (path, token) => {
  const baseUrl = getFileBaseUrl();

  const url = `${baseUrl}${path}`;

  if (token) {
    return `${url}?token=${encodeURIComponent(token)}`;
  }

  return url;
};

// ============================================================
// HEALTH & SYSTEM API
// ============================================================

export const healthApi = {
  checkHealth: () => api.get('/health')
};

// ============================================================
// AUTHENTICATION API
// ============================================================

export const authApi = {
  register: (data) => api.post('/auth/register', data),

  login: (data) => api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data) =>
    api.patch('/auth/profile', data)
};

// ============================================================
// DOCUMENTS API
// ============================================================

export const documentsApi = {
  // Get all documents
  getAll: (params) =>
    api.get('/documents', { params }),

  // Get one document
  getById: (id) =>
    api.get(`/documents/${id}`),

  // Upload document
  upload: (formData, onProgress) =>
    api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    }),

  // Update document metadata
  update: (id, data) =>
    api.patch(`/documents/${id}`, data),

  // Delete document
  delete: (id) =>
    api.delete(`/documents/${id}`),

  // Reprocess document
  reprocess: (id) =>
    api.post(`/documents/${id}/reprocess`),

  // Search documents
  search: (params) =>
    api.get('/documents/search', { params }),

  // Get expiring documents
  getExpiring: () =>
    api.get('/documents/expiring'),

  // Get dashboard statistics
  getStats: () =>
    api.get('/documents/stats'),

  // ==========================================================
  // FILE PREVIEW
  // ==========================================================
  // IMPORTANT:
  // This now points to the Render backend instead of Vercel.
  // ==========================================================

  getPreviewUrl: (id, token) =>
    buildFileUrl(
      `/documents/${id}/preview`,
      token
    ),

  // ==========================================================
  // FILE DOWNLOAD
  // ==========================================================

  getDownloadUrl: (id, token) =>
    buildFileUrl(
      `/documents/${id}/download`,
      token
    )
};

export const documentApi = documentsApi;

// ============================================================
// CATEGORIES API
// ============================================================

export const categoriesApi = {
  getAll: () =>
    api.get('/categories'),

  create: (data) =>
    api.post('/categories', data),

  delete: (id) =>
    api.delete(`/categories/${id}`)
};

export const categoryApi = categoriesApi;

// ============================================================
// REMINDERS API
// ============================================================

export const remindersApi = {
  getAll: () =>
    api.get('/reminders'),

  create: (data) =>
    api.post('/reminders', data),

  update: (id, data) =>
    api.patch(`/reminders/${id}`, data),

  delete: (id) =>
    api.delete(`/reminders/${id}`)
};

export const reminderApi = remindersApi;

// ============================================================
// NOTIFICATIONS API
// ============================================================

export const notificationsApi = {
  getAll: () =>
    api.get('/notifications'),

  markRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.post('/notifications/mark-all-read'),

  delete: (id) =>
    api.delete(`/notifications/${id}`)
};

export const notificationApi = notificationsApi;

// ============================================================
// AUDIT LOGGING API
// ============================================================

export const auditApi = {
  getAll: (params) =>
    api.get('/audit', { params })
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;