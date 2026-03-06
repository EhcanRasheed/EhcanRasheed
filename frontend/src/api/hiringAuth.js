import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/hiring-auth';

const hiringAuthApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

hiringAuthApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hiringAccessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const hiringRegister = async (data) => {
  const res = await hiringAuthApi.post('/register', data);
  return res.data;
};

export const hiringSubmitPayment = async (userId, paymentMethod, screenshotBase64) => {
  const res = await hiringAuthApi.post('/submit-payment', { userId, paymentMethod, screenshotBase64 });
  return res.data;
};

export const hiringLogin = async (data) => {
  const res = await hiringAuthApi.post('/login', data);
  return res.data;
};

export const hiringLogout = async () => {
  const res = await hiringAuthApi.post('/logout');
  return res.data;
};

export const hiringGetMe = async () => {
  const res = await hiringAuthApi.get('/me');
  return res.data;
};

export const hiringGetPaymentStatus = async (userId) => {
  const res = await hiringAuthApi.get('/payment-status', { params: { userId } });
  return res.data;
};

export default hiringAuthApi;
