'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

const refreshUser = useCallback(async () => {
  try {
    const res = await fetch('/api/auth/me');

    console.log("Status:", res.status);

    const text = await res.text();

    console.log("Response:", text);

    if (!text) {
      setUser(null);
      return;
    }

    const data = JSON.parse(text);

    if (data.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  } catch (error) {
    console.error("Failed to restore auth session:", error);
    setUser(null);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      
      // Route based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/citizen/dashboard');
      }
      return { success: true };
    } catch (error: any) {
      console.error('Login action error:', error);
      return { success: false, error: 'An unexpected connection error occurred' };
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      router.push('/citizen/dashboard');
      return { success: true };
    } catch (error: any) {
      console.error('Registration action error:', error);
      return { success: false, error: 'An unexpected connection error occurred' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout action error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
