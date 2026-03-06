import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/hiring';

const hiringApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

hiringApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hiringAccessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ───── Dashboard ─────
export const getDashboard = async () => {
  const res = await hiringApi.get('/dashboard');
  return res.data;
};

// ───── Question Banks ─────
export const getAvailableBanks = async () => {
  const res = await hiringApi.get('/banks');
  return res.data;
};

export const getBankQuestions = async (bankId) => {
  const res = await hiringApi.get(`/banks/${bankId}`);
  return res.data;
};

export const createCustomBank = async (data) => {
  const res = await hiringApi.post('/banks', data);
  return res.data;
};

// ───── Sessions ─────
export const createSession = async (data) => {
  const res = await hiringApi.post('/sessions', data);
  return res.data;
};

export const getSessions = async () => {
  const res = await hiringApi.get('/sessions');
  return res.data;
};

export const getSessionDetail = async (id) => {
  const res = await hiringApi.get(`/sessions/${id}`);
  return res.data;
};

export const deactivateSession = async (id) => {
  const res = await hiringApi.patch(`/sessions/${id}/deactivate`);
  return res.data;
};

export const deleteSession = async (id) => {
  const res = await hiringApi.delete(`/sessions/${id}`);
  return res.data;
};

// ───── Candidates ─────
export const getCandidateDetail = async (id) => {
  const res = await hiringApi.get(`/candidates/${id}`);
  return res.data;
};

export const getCandidateResume = async (id) => {
  const res = await hiringApi.get(`/candidates/${id}/resume`);
  return res.data;
};

// ───── Public / Candidate-facing (no auth) ─────
const publicApi = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/hire',
  headers: { 'Content-Type': 'application/json' },
});

export const getPublicSessionInfo = async (sessionId) => {
  const res = await publicApi.get(`/${sessionId}/info`);
  return res.data;
};

export const joinSession = async (sessionId, formData) => {
  // formData is a FormData with name, email, resume file
  const res = await publicApi.post(`/${sessionId}/join`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getCandidateQuestions = async (sessionId, candidateId) => {
  const res = await publicApi.get(`/${sessionId}/candidate/${candidateId}/questions`);
  return res.data;
};

export const submitCandidateAnswer = async (sessionId, candidateId, data) => {
  const res = await publicApi.post(`/${sessionId}/candidate/${candidateId}/answer`, data);
  return res.data;
};

export const endCandidateInterview = async (sessionId, candidateId) => {
  const res = await publicApi.post(`/${sessionId}/candidate/${candidateId}/end`);
  return res.data;
};

// ───── Admin (uses main app's admin token) ─────
const adminHiringApi = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/hiring',
  headers: { 'Content-Type': 'application/json' },
});

adminHiringApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // main app admin token
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getHiringPayments = async () => {
  const res = await adminHiringApi.get('/payments');
  return res.data;
};

export const approveHiringPayment = async (id) => {
  const res = await adminHiringApi.patch(`/payments/${id}/approve`);
  return res.data;
};

export const rejectHiringPayment = async (id, reason) => {
  const res = await adminHiringApi.patch(`/payments/${id}/reject`, { reason });
  return res.data;
};

export const deleteHiringPayment = async (id) => {
  const res = await adminHiringApi.delete(`/payments/${id}`);
  return res.data;
};

export const getHiringUsers = async () => {
  const res = await adminHiringApi.get('/users');
  return res.data;
};

export const deleteHiringUser = async (id) => {
  const res = await adminHiringApi.delete(`/users/${id}`);
  return res.data;
};

export default hiringApi;
