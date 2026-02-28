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

/** Get all available question banks */
export const getAvailableBanks = async () => {
  const res = await api.get('/interview-sessions/banks');
  return res.data;
};

/** Start a new interview session */
export const startSession = async (bankId) => {
  const res = await api.post('/interview-sessions/start', { bankId });
  return res.data;
};

/** Get questions for a session */
export const getSessionQuestions = async (sessionId) => {
  const res = await api.get(`/interview-sessions/${sessionId}/questions`);
  return res.data;
};

/** Submit an answer for a question */
export const submitAnswer = async (sessionId, questionId, answerText, questionOrder) => {
  const res = await api.post(`/interview-sessions/${sessionId}/answer`, {
    questionId,
    answerText,
    questionOrder,
  });
  return res.data;
};

/** End the session and get evaluation */
export const endSession = async (sessionId) => {
  const res = await api.post(`/interview-sessions/${sessionId}/end`);
  return res.data;
};

/** Get user's interview history */
export const getMyHistory = async () => {
  const res = await api.get('/interview-sessions/history/me');
  return res.data;
};

/** Get detailed result for one session */
export const getSessionDetail = async (sessionId) => {
  const res = await api.get(`/interview-sessions/${sessionId}/detail`);
  return res.data;
};

/** Delete a session */
export const deleteSession = async (sessionId) => {
  const res = await api.delete(`/interview-sessions/${sessionId}`);
  return res.data;
};

/** Submit feedback for a question bank */
export const submitBankFeedback = async (bankId, { rating, comment }) => {
  const res = await api.post(`/interview-sessions/banks/${bankId}/feedback`, { rating, comment });
  return res.data;
};

/** Get feedback summary for a bank */
export const getBankFeedbackSummary = async (bankId) => {
  const res = await api.get(`/interview-sessions/banks/${bankId}/feedback`);
  return res.data;
};

export default api;
