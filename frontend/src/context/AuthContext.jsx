import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!accessToken;

  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        try {
          const data = await authApi.getMe();
          setUser(data.user || data);
        } catch (err) {
          console.error('Failed to fetch user:', err);
          setAccessToken(null);
          setRefreshToken(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    init();
  }, [accessToken]);

  const saveTokens = ({ accessToken: a, refreshToken: r }) => {
    if (a) {
      setAccessToken(a);
      localStorage.setItem('accessToken', a);
    }
    if (r) {
      setRefreshToken(r);
      localStorage.setItem('refreshToken', r);
    }
  };

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    saveTokens(data);
    if (data.accessToken) {
      const me = await authApi.getMe();
      setUser(me.user || me);
    }
    return data;
  };

  const register = async (userData) => authApi.register(userData);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout request failed', err);
    }
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const sendActivation = async (email) => authApi.sendActivation(email);
  const activateAccount = async (token) => authApi.activateAccount(token);
  const forgotPassword = async (email) => authApi.forgotPassword(email);
  const resetPassword = async (password, token) => authApi.resetPassword(token, password);

  const changePassword = async (currentPassword, newPassword) => {
    if (!accessToken) throw new Error('Not authenticated');
    return authApi.changePassword(currentPassword, newPassword);
  };

  const updateUser = (payload) => {
    setUser((prev) => (prev ? { ...prev, ...payload } : null));
  };

  const changeUsername = async (newUsername) => {
    if (!accessToken) throw new Error('Not authenticated');
    const data = await authApi.changeUsername(newUsername);
    if (data.user) updateUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        sendActivation,
        activateAccount,
        forgotPassword,
        resetPassword,
        changePassword,
        updateUser,
        changeUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};