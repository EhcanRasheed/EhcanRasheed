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

export const saveResumeAnalysis = async (data) => {
  const res = await api.post('/resume/sessions', data);
  return res.data;
};

export const listResumeAnalyses = async () => {
  const res = await api.get('/resume/sessions');
  return res.data;
};

export const getResumeAnalysis = async (id) => {
  const res = await api.get(`/resume/sessions/${id}`);
  return res.data;
};

export const deleteResumeAnalysis = async (id) => {
  const res = await api.delete(`/resume/sessions/${id}`);
  return res.data;
};

export const updateResumeAnalysis = async (id, data) => {
  const res = await api.patch(`/resume/sessions/${id}`, data);
  return res.data;
};
