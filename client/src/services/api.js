import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
  if (token) {
    localStorage.setItem('expense_app_token', token);
  } else {
    localStorage.removeItem('expense_app_token');
  }
};

export const getStoredAuth = () => {
  const token = localStorage.getItem('expense_app_token');
  const userJson = localStorage.getItem('expense_app_user');
  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch {
    user = null;
  }
  if (token) {
    authToken = token;
  }
  return { token, user };
};

export const storeUser = (user) => {
  if (user) {
    localStorage.setItem('expense_app_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('expense_app_user');
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // Retry logic for network errors or 5xx errors
    if (
      (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
      !originalRequest._retry &&
      (originalRequest._retryCount || 0) < 3
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Exponential backoff: wait 1s, 2s, 4s
      const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000;
      
      await new Promise(resolve => setTimeout(resolve, delay));

      return api(originalRequest);
    }

    // If unauthorized, clear local storage token
    if (error.response && error.response.status === 401) {
      setAuthToken(null);
      storeUser(null);
    }

    return Promise.reject(error);
  }
);

// ===== Auth APIs =====

export const signup = async ({ name, email, password }) => {
  try {
    const response = await api.post('/auth/signup', { name, email, password });
    const { token, user } = response.data;
    if (token) {
      setAuthToken(token);
      storeUser(user);
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      const data = error.response.data;
      if (data.errors && Array.isArray(data.errors)) {
        const msg = data.errors.map(e => e.msg).join(', ');
        throw new Error(msg);
      }
      throw new Error(data.error || 'Failed to sign up');
    } else if (error.request) {
      throw new Error('Network error. Please try again.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    if (token) {
      setAuthToken(token);
      storeUser(user);
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      const data = error.response.data;
      if (data.errors && Array.isArray(data.errors)) {
        const msg = data.errors.map(e => e.msg).join(', ');
        throw new Error(msg);
      }
      throw new Error(data.error || 'Failed to log in');
    } else if (error.request) {
      throw new Error('Network error. Please try again.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export const logout = () => {
  setAuthToken(null);
  storeUser(null);
};

// ===== Expense APIs =====

export const fetchExpenses = async (category = '', sort = 'date_desc', search = '', startDate = '', endDate = '') => {
  try {
    const params = {};
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (search) params.search = search;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/expenses', { params });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch expenses');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export const exportExpensesCSV = async (category = '', startDate = '', endDate = '') => {
  try {
    const params = {};
    if (category) params.category = category;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/expenses/export/csv', { 
      params,
      responseType: 'blob' 
    });
    
    // Create blob and download
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to export expenses');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export const createExpense = async (expenseData) => {
  try {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map(e => e.msg).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(errorData.error || 'Failed to create expense');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export const updateExpense = async (id, updates) => {
  try {
    const response = await api.put(`/expenses/${id}`, updates);
    return response.data;
  } catch (error) {
    if (error.response) {
      const data = error.response.data;
      if (data.errors && Array.isArray(data.errors)) {
        const msg = data.errors.map(e => e.msg).join(', ');
        throw new Error(msg);
      }
      throw new Error(data.error || 'Failed to update expense');
    } else if (error.request) {
      throw new Error('Network error. Please try again.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const data = error.response.data;
      if (data.errors && Array.isArray(data.errors)) {
        const msg = data.errors.map(e => e.msg).join(', ');
        throw new Error(msg);
      }
      throw new Error(data.error || 'Failed to delete expense');
    } else if (error.request) {
      throw new Error('Network error. Please try again.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};


