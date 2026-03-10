'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { method: 'GET' });
        if (!response.ok) {
          setIsAuthenticated(false);
          setUser(null);
          setRole(null);
          return;
        }

        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setRole(data.user.role);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setRole(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string, selectedRole: UserRole) => {
    setIsLoading(true);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role: selectedRole }),
    });

    if (!response.ok) {
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    setUser(data.user);
    setRole(data.user.role);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
