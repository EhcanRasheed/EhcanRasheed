import React, { createContext, useContext, useState, useEffect } from 'react';
import { hiringGetMe, hiringLogin as apiLogin, hiringLogout as apiLogout } from '../api/hiringAuth';

const HiringAuthContext = createContext(null);

export const useHiringAuth = () => {
  const ctx = useContext(HiringAuthContext);
  if (!ctx) throw new Error('useHiringAuth must be used within HiringAuthProvider');
  return ctx;
};

export const HiringAuthProvider = ({ children }) => {
  const [hiringUser, setHiringUser] = useState(null);
  const [hiringToken, setHiringToken] = useState(localStorage.getItem('hiringAccessToken'));
  const [loading, setLoading] = useState(true);

  const isHiringAuthenticated = !!hiringToken;

  useEffect(() => {
    const init = async () => {
      if (hiringToken) {
        try {
          const data = await hiringGetMe();
          setHiringUser(data.user);
        } catch {
          localStorage.removeItem('hiringAccessToken');
          localStorage.removeItem('hiringRefreshToken');
          setHiringToken(null);
          setHiringUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, [hiringToken]);

  const login = async (email, password) => {
    const data = await apiLogin({ email, password });
    localStorage.setItem('hiringAccessToken', data.accessToken);
    localStorage.setItem('hiringRefreshToken', data.refreshToken);
    setHiringToken(data.accessToken);
    const me = await hiringGetMe();
    setHiringUser(me.user);
    return data;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch { /* ignore */ }
    localStorage.removeItem('hiringAccessToken');
    localStorage.removeItem('hiringRefreshToken');
    setHiringToken(null);
    setHiringUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await hiringGetMe();
      setHiringUser(data.user);
    } catch { /* ignore */ }
  };

  return (
    <HiringAuthContext.Provider
      value={{
        hiringUser,
        hiringToken,
        isHiringAuthenticated,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </HiringAuthContext.Provider>
  );
};

export default HiringAuthContext;
