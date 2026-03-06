import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ─── User Management ───
export const getAllUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const updateUser = async (id, dto) => {
  const res = await api.patch(`/admin/users/${id}`, dto);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

// ─── Question Bank Management ───
export const getAllBanks = async () => {
  const res = await api.get('/admin/banks');
  return res.data;
};

export const getBankById = async (id) => {
  const res = await api.get(`/admin/banks/${id}`);
  return res.data;
};

export const createBank = async (dto) => {
  const res = await api.post('/admin/banks', dto);
  return res.data;
};

export const createBankWithQuestions = async (name, category, questions) => {
  const res = await api.post('/admin/banks/create-with-questions', { name, category, questions });
  return res.data;
};

export const updateBank = async (id, dto) => {
  const res = await api.patch(`/admin/banks/${id}`, dto);
  return res.data;
};

export const togglePublishBank = async (id) => {
  const res = await api.patch(`/admin/banks/${id}/toggle-publish`);
  return res.data;
};

export const deleteBank = async (id) => {
  const res = await api.delete(`/admin/banks/${id}`);
  return res.data;
};

export const bulkUploadQuestions = async (bankId, questions) => {
  const res = await api.post(`/admin/banks/${bankId}/questions`, { questions });
  return res.data;
};

export const updateQuestion = async (id, dto) => {
  const res = await api.patch(`/admin/questions/${id}`, dto);
  return res.data;
};

export const deleteQuestion = async (id) => {
  const res = await api.delete(`/admin/questions/${id}`);
  return res.data;
};

/** Get feedback for a specific bank */
export const getBankFeedback = async (bankId) => {
  const res = await api.get(`/admin/banks/${bankId}/feedback`);
  return res.data;
};

/** Get feedback counts for all banks */
export const getAllBankFeedbackCounts = async () => {
  const res = await api.get('/admin/feedback/counts');
  return res.data;
};

// ─── Payment Management ───
export const getPayments = async () => {
  const res = await api.get('/payments');
  return res.data;
};

export const approvePayment = async (id) => {
  const res = await api.patch(`/payments/${id}/approve`);
  return res.data;
};

export const rejectPayment = async (id) => {
  const res = await api.patch(`/payments/${id}/reject`);
  return res.data;
};

export const deletePayment = async (id) => {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
};

export default api;
