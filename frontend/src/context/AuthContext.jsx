import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const expire = () => {
      if (active) setUser(null);
    };
    window.addEventListener('cronos:auth-expired', expire);

    const initialize = async () => {
      if (api.getStoredTokens()?.refresh) {
        try {
          const currentUser = await api.me();
          if (active) setUser(currentUser);
        } catch {
          api.setTokens(null);
        }
      }
      if (active) setLoading(false);
    };
    initialize();

    return () => {
      active = false;
      window.removeEventListener('cronos:auth-expired', expire);
    };
  }, []);

  const login = async (credentials) => {
    const result = await api.login(credentials);
    setUser(result.user);
    return result.user;
  };

  const register = async (data) => {
    await api.register(data);
    return login({ username: data.username, password: data.password });
  };

  const logout = async () => {
    try { await api.logout(); } finally { setUser(null); }
  };

  const updateUser = (userData) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : userData));
  };

  const refreshUser = async () => {
    try {
      const refreshed = await api.me();
      setUser(refreshed);
      return refreshed;
    } catch {
      return null;
    }
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout, updateUser, refreshUser }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-24 text-center font-mono text-xs text-cronos-muted">VERIFICANDO SESIÓN…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
