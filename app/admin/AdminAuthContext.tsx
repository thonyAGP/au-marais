'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  token: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const verifyToken = useCallback(async (storedToken: string) => {
    try {
      const response = await fetch('/api/auth', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (response.ok) {
        setIsAuthenticated(true);
        setToken(storedToken);
      } else {
        sessionStorage.removeItem('adminToken');
        document.cookie = 'adminToken=; path=/; max-age=0';
        setIsAuthenticated(false);
        setToken(null);
      }
    } catch {
      sessionStorage.removeItem('adminToken');
      document.cookie = 'adminToken=; path=/; max-age=0';
      setIsAuthenticated(false);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('adminToken');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [verifyToken]);

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        sessionStorage.setItem('adminToken', data.token);
        document.cookie = `adminToken=${data.token}; path=/; max-age=86400`;
        setIsAuthenticated(true);
        setToken(data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Mot de passe incorrect' };
      }
    } catch {
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminToken');
    document.cookie = 'adminToken=; path=/; max-age=0';
    setIsAuthenticated(false);
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, token }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
