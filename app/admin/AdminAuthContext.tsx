'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_BEFORE_LOGOUT = 60 * 1000; // 1 minute warning

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  token: string | null;
  showTimeoutWarning: boolean;
  extendSession: () => void;
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
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearTimers();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLastActivity');
    document.cookie = 'adminToken=; path=/; max-age=0';
    setIsAuthenticated(false);
    setToken(null);
    setShowTimeoutWarning(false);
  }, [clearTimers]);

  const startInactivityTimer = useCallback(() => {
    clearTimers();

    // Show warning 1 minute before logout
    warningTimerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

    // Logout after inactivity timeout
    inactivityTimerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [clearTimers, logout]);

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    localStorage.setItem('adminLastActivity', String(Date.now()));
    setShowTimeoutWarning(false);
    if (isAuthenticated) {
      startInactivityTimer();
    }
  }, [isAuthenticated, startInactivityTimer]);

  const extendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      resetInactivityTimer();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start timer
    startInactivityTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [isAuthenticated, resetInactivityTimer, startInactivityTimer, clearTimers]);

  const verifyToken = useCallback(async (storedToken: string) => {
    try {
      const response = await fetch('/api/auth', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (response.ok) {
        // Check if session has expired due to inactivity
        const lastActivity = localStorage.getItem('adminLastActivity');
        if (lastActivity) {
          const elapsed = Date.now() - Number(lastActivity);
          if (elapsed > INACTIVITY_TIMEOUT) {
            // Session expired, logout
            logout();
            return;
          }
        }

        setIsAuthenticated(true);
        setToken(storedToken);
        localStorage.setItem('adminLastActivity', String(Date.now()));
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
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
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminLastActivity', String(Date.now()));
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

  return (
    <AdminAuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      logout,
      token,
      showTimeoutWarning,
      extendSession
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
