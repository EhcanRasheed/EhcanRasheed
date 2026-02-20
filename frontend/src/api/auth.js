// // import axios from 'axios';

// // // Base URL for the Auth module
// // const API_BASE_URL = 'http://localhost:3000/auth';

// // // Create an Axios instance configured for the auth module
// // // We export this default instance in case you want to add interceptors later
// // // for token refreshing/error handling.
// // const authApi = axios.create({
// //   baseURL: API_BASE_URL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// // });

// // // Attach access token from localStorage to each request when available
// // authApi.interceptors.request.use((config) => {
// //   try {
// //     const token = localStorage.getItem('accessToken');
// //     if (token) config.headers.Authorization = `Bearer ${token}`;
// //   } catch (err) {
// //     // ignore
// //   }
// //   return config;
// // });

// // // Simple refresh-token flow on 401 responses
// // let isRefreshing = false;
// // let failedQueue = [];

// // const processQueue = (error, token = null) => {
// //   failedQueue.forEach((prom) => {
// //     if (error) {
// //       prom.reject(error);
// //     } else {
// //       prom.resolve(token);
// //     }
// //   });
// //   failedQueue = [];
// // };

// // authApi.interceptors.response.use(
// //   (resp) => resp,
// //   async (err) => {
// //     const originalRequest = err.config;
// //     if (!originalRequest) return Promise.reject(err);
// //     if (err.response && err.response.status === 401 && !originalRequest._retry) {
// //       const refreshToken = localStorage.getItem('refreshToken');
// //       if (!refreshToken) {
// //         // no refresh token available
// //         return Promise.reject(err);
// //       }

// //       if (isRefreshing) {
// //         return new Promise(function (resolve, reject) {
// //           failedQueue.push({ resolve, reject });
// //         })
// //           .then((token) => {
// //             originalRequest.headers.Authorization = 'Bearer ' + token;
// //             return authApi(originalRequest);
// //           })
// //           .catch((e) => Promise.reject(e));
// //       }

// //       originalRequest._retry = true;
// //       isRefreshing = true;

// //       try {
// //         // call refresh endpoint directly (avoid interceptor loop by using axios)
// //         const response = await axios.post(`${API_BASE_URL}/refresh`, { refreshToken });
// //         const data = response.data || {};
// //         const newAccess = data.accessToken || data.access;
// //         const newRefresh = data.refreshToken || data.refresh;
// //         if (newAccess) {
// //           localStorage.setItem('accessToken', newAccess);
// //           if (newRefresh) localStorage.setItem('refreshToken', newRefresh);
// //           processQueue(null, newAccess);
// //           originalRequest.headers.Authorization = 'Bearer ' + newAccess;
// //           return authApi(originalRequest);
// //         }
// //         processQueue(new Error('No new access token in refresh response'), null);
// //         return Promise.reject(err);
// //       } catch (refreshErr) {
// //         processQueue(refreshErr, null);
// //         // clear tokens on refresh failure
// //         localStorage.removeItem('accessToken');
// //         localStorage.removeItem('refreshToken');
// //         return Promise.reject(refreshErr);
// //       } finally {
// //         isRefreshing = false;
// //       }
// //     }
// //     return Promise.reject(err);
// //   }
// // );

// // /**
// //  * Registers a new user (POST /register).
// //  */
// // // export const register = async (fullName, email, password, age, gender) => {
// // //   const response = await authApi.post('/register', { fullName, email, password, age, gender });
// // //   return response.data;
// // // };
// // export const register = async (userData) => {
// //   const response = await authApi.post('/register', userData);
// //   return response.data;
// // };

// // /**
// //  * Logs in a user (POST /login).
// //  * Returns accessToken and refreshToken.
// //  */
// // export const login = async (email, password) => {
// //   const response = await authApi.post('/login', { email, password });
// //   return response.data;
// // };

// // /**
// //  * Sends a password reset email (POST /forgot-password).
// //  */
// // export const forgotPassword = async (email) => {
// //   const response = await authApi.post('/forgot-password', { email });
// //   return response.data;
// // };

// // /**
// //  * Resets the user's password using the token (POST /reset-password).
// //  * Note: Token is sent as a query parameter as per your API structure.
// //  */
// // export const resetPassword = async (password, token) => {
// //   const response = await authApi.post(`/reset-password?token=${encodeURIComponent(token)}`, { password });
// //   return response.data;
// // };

// // /**
// //  * Activates a user's account (POST /activate).
// //  */
// // export const activateAccount = async (token) => {
// //   const response = await authApi.post('/activate', { token });
// //   return response.data;
// // };

// // /**
// //  * Gets the current logged-in user information (GET /me).
// //  * Requires the JWT access token in the Authorization header.
// //  */
// // export const getMe = async () => {
// //   const response = await authApi.get('/me');
// //   return response.data;
// // };

// // export default authApi;

// // /**
// //  * Send account activation email (POST /send-activation)
// //  */
// // export const sendActivation = async (email) => {
// //   const response = await authApi.post('/send-activation', { email });
// //   return response.data;
// // };

// // /**
// //  * Change password (POST /change-password) - requires JWT
// //  */
// // export const changePassword = async (currentPassword, newPassword) => {
// //   const response = await authApi.post('/change-password', { currentPassword, newPassword });
// //   return response.data;
// // };

// // /**
// //  * Logout from all sessions (POST /logout) - requires JWT
// //  */
// // export const logout = async () => {
// //   const response = await authApi.post('/logout');
// //   return response.data;
// // };

// // /**
// //  * Create admin user (POST /create-admin) - requires JWT
// //  */
// // export const createAdmin = async (adminData) => {
// //   const response = await authApi.post('/create-admin', adminData);
// //   return response.data;
// // };

// // /**
// //  * Activate account (alternate form) - keep previous but also support query-style token
// //  */
// // export const activateWithQuery = async (token) => {
// //   const response = await authApi.post(`/activate?token=${encodeURIComponent(token)}`);
// //   return response.data;
// // };

// // /**
// //  * Refresh tokens using refresh token.
// //  * Assumes your backend exposes POST /auth/refresh and returns { accessToken, refreshToken }
// //  */
// // export const refreshTokens = async (refreshToken) => {
// //   const response = await axios.post(`${API_BASE_URL}/refresh`, { refreshToken });
// //   return response.data;
// // };
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3000/auth';

// const authApi = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// authApi.interceptors.request.use((config) => {
//   const token = localStorage.getItem('accessToken');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export const register = async (userData) => {
//   const response = await authApi.post('/register', userData);
//   return response.data;
// };

// export const login = async (userData) => {
//   const response = await authApi.post('/login', userData);
//   return response.data;
// };

// export const getMe = async () => {
//   const response = await authApi.get('/me');
//   return response.data;
// };

// export const logout = async () => {
//   const response = await authApi.post('/logout');
//   return response.data;
// };

// export default authApi;
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/auth';

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
