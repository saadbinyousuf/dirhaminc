import axios from 'axios';

// Base Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5050/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error handler
const handleError = (error) => {
  if (error.response && error.response.data && error.response.data.error) {
    throw error.response.data.error;
  } else if (error.response && error.response.data) {
    throw JSON.stringify(error.response.data);
  } else if (error.request) {
    throw new Error('No response from server');
  } else {
    throw error.message || 'Unknown error';
  }
};

// Auth
export const login = async (data) => {
  try {
    const res = await api.post('/auth/login', data);
    if (res.data.token) localStorage.setItem('jwt_token', res.data.token);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const register = async (data) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Transactions CRUD
export const getTransactions = async () => {
  try {
    const res = await api.get('/transactions');
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const addTransaction = async (data) => {
  try {
    const res = await api.post('/transactions', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateTransaction = async (id, data) => {
  try {
    const res = await api.put(`/transactions/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteTransaction = async (id) => {
  try {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Bulk add transactions
export const addTransactionsBulk = async (transactionsArray) => {
  try {
    const res = await api.post('/transactions/bulk', { transactions: transactionsArray });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Budgets CRUD
export const getBudgets = async () => {
  try {
    const res = await api.get('/budgets');
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const addBudget = async (data) => {
  try {
    const res = await api.post('/budgets', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateBudget = async (id, data) => {
  try {
    const res = await api.put(`/budgets/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteBudget = async (id) => {
  try {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Notes CRUD
export const getNotes = async () => {
  try {
    const res = await api.get('/notes');
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const addNote = async (data) => {
  try {
    const res = await api.post('/notes', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateNote = async (id, data) => {
  try {
    const res = await api.put(`/notes/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteNote = async (id) => {
  try {
    const res = await api.delete(`/notes/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Pending Transactions CRUD
export const getPendingTransactions = async () => {
  try {
    const res = await api.get('/pending');
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const addPendingTransaction = async (data) => {
  try {
    const res = await api.post('/pending', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updatePendingTransaction = async (id, data) => {
  try {
    const res = await api.put(`/pending/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const approvePendingTransaction = async (id) => {
  try {
    const res = await api.post(`/pending/${id}/approve`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const deletePendingTransaction = async (id) => {
  try {
    const res = await api.delete(`/pending/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Accounts CRUD
export const getAccounts = async () => {
  try {
    const res = await api.get('/accounts');
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const addAccount = async (data) => {
  try {
    const res = await api.post('/accounts', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateAccount = async (id, data) => {
  try {
    const res = await api.put(`/accounts/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteAccount = async (id) => {
  try {
    const res = await api.delete(`/accounts/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// User Profile
export const getProfile = async () => {
  try {
    const res = await api.get('/auth/profile');
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateProfile = async (data) => {
  try {
    const res = await api.put('/auth/profile', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const changePassword = async (data) => {
  try {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Categories & Tags
export const getCategories = async () => {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const addCategory = async (data) => {
  try {
    const res = await api.post('/categories', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateCategory = async (id, data) => {
  try {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteCategory = async (id) => {
  try {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// File Upload (profile photo)
export const uploadProfilePhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post('/auth/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Export Data
export const exportData = async () => {
  try {
    const res = await api.get('/export');
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Import Data
export const importData = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

// Settings (notifications, appearance, etc.)
export const getSettings = async () => {
  try {
    const res = await api.get('/settings');
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateSettings = async (data) => {
  try {
    const res = await api.put('/settings', data);
    return res.data;
  } catch (error) {
    handleError(error);
  }
};

export default api;
