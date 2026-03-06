import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = async (userData) => {
  const response = await authApi.post('/register', userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await authApi.post('/login', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await authApi.get('/me');
  return response.data;
};

export const logout = async () => {
  const response = await authApi.post('/logout');
  return response.data;
};
export const forgotPassword = async (email) => {
  const response = await authApi.post('/forgot-password', { email });
  return response.data;
};
export const resetPassword = async (token, newPassword) => {
  if (!token) throw new Error('Missing reset token');
  const response = await authApi.post('/reset-password', { token: token.trim(), newPassword });
  return response.data;
};

export const activateAccount = async (token) => {
  const response = await authApi.post('/activate', { token });
  return response.data;
};

export const sendActivation = async (email) => {
  const response = await authApi.post('/send-activation', { email });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await authApi.post('/change-password', { currentPassword, newPassword });
  return response.data;
};

export const changeUsername = async (newUsername) => {
  const response = await authApi.post('/change-username', { newUsername });
  return response.data;
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getUsage = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${BASE_URL}/user/usage`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
