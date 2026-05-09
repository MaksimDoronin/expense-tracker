'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { AuthResult, AuthUser } from '@/shared/types/auth';

const TOKEN_KEY = 'access_token';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (result: AuthResult) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  const setAuth = useCallback((result: AuthResult) => {
    localStorage.setItem(TOKEN_KEY, result.tokens.accessToken);
    setToken(result.tokens.accessToken);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
