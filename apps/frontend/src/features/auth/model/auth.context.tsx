'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '@/features/auth/api/auth.api';
import type { AuthResult, AuthUser } from '@/shared/types/auth';

const TOKEN_KEY = 'access_token';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  setAuth: (result: AuthResult) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false);

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

  useEffect(() => {
    if (!token || user) return;
    let cancelled = false;
    setIsLoadingUser(true);
    authApi
      .me()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUser(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, user, logout]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, isLoadingUser, setAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
