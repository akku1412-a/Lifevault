import axios from 'axios';

// Base Axios instance configured with sensible defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor: attach Bearer token automatically
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

// Response interceptor for consistent error unwrapping
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Network error occurred',
      code: error.response?.data?.code || 'NETWORK_ERROR',
      status: error.response?.status || 500,
      data: error.response?.data
    };
    return Promise.reject(customError);
  }
);

// Health & System API
export const healthApi = {
  checkHealth: () => api.get('/health')
};

// Authentication API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data)
};

// Documents API
export const documentsApi = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData, onProgress) =>
    api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    }),
  update: (id, data) => api.patch(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
  reprocess: (id) => api.post(`/documents/${id}/reprocess`),
  search: (params) => api.get('/documents/search', { params }),
  getExpiring: () => api.get('/documents/expiring'),
  getStats: () => api.get('/documents/stats'),
  getPreviewUrl: (id, token) => `/api/documents/${id}/preview${token ? `?token=${token}` : ''}`,
  getDownloadUrl: (id, token) => `/api/documents/${id}/download${token ? `?token=${token}` : ''}`
};

export const documentApi = documentsApi;

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  delete: (id) => api.delete(`/categories/${id}`)
};

export const categoryApi = categoriesApi;

// Reminders API
export const remindersApi = {
  getAll: () => api.get('/reminders'),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.patch(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`)
};

export const reminderApi = remindersApi;

// Notifications API
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export const notificationApi = notificationsApi;

// Audit Logging API
export const auditApi = {
  getAll: (params) => api.get('/audit', { params })
};

export default api;
