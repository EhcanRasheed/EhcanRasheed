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

export const saveChatSession = async (data) => {
  const res = await api.post('/chatbot/sessions', data);
  return res.data;
};

export const listChatSessions = async () => {
  const res = await api.get('/chatbot/sessions');
  return res.data;
};

export const getChatSession = async (id) => {
  const res = await api.get(`/chatbot/sessions/${id}`);
  return res.data;
};

export const deleteChatSession = async (id) => {
  const res = await api.delete(`/chatbot/sessions/${id}`);
  return res.data;
};
