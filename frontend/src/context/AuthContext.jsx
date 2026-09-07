import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginRequest, registerRequest, meRequest } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('fairshare_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fairshare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate any stored token against the API on first load. If it's
    // expired or invalid, the interceptor in api/client.js will already
    // have cleared storage on the 401, so we just reflect that here.
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const freshUser = await meRequest();
        setUser(freshUser);
        localStorage.setItem('fairshare_user', JSON.stringify(freshUser));
      } catch (e) {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (t, u) => {
    localStorage.setItem('fairshare_token', t);
    localStorage.setItem('fairshare_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = useCallback(async (email, password) => {
    const { token: t, user: u } = await loginRequest({ email, password });
    persist(t, u);
    return u;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { token: t, user: u } = await registerRequest({ name, email, password });
    persist(t, u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fairshare_token');
    localStorage.removeItem('fairshare_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
