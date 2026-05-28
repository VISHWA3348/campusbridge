'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  collegeId: number | null;
  college?: any;
  profilePhoto?: string | null;
  bio?: string | null;
  student?: any;
  alumni?: any;
  verificationStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  idProofUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<any>;
  updateUser: (user: User) => void;
  loading: boolean;
}

const rawApiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com');
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to check if a JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      // Check if token is expired before restoring session
      if (isTokenExpired(savedToken)) {
        console.warn('[AuthContext] Stored token is expired - clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        setToken(savedToken);
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          console.error('[AuthContext] Failed to parse stored user');
          localStorage.removeItem('user');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Redirect based on role
    const roleRoutes: Record<string, string> = {
      STUDENT: '/dashboard/student',
      ALUMNI: '/dashboard/alumni',
      COLLEGE_ADMIN: '/dashboard/college-admin',
      SUPER_ADMIN: '/dashboard/super-admin',
    };
    router.push(roleRoutes[newUser.role] || '/');
  };

  const refreshUser = async (retries = 1) => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) return;

    if (isTokenExpired(currentToken)) {
      console.warn('[AuthContext] Token expired during refreshUser - logging out');
      logout();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profile/me`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      
      if (res.status === 401) {
        console.warn('[AuthContext] refreshUser received 401 - logging out');
        logout();
        return;
      }
      
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const freshUser = await res.json();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          return freshUser;
        } else {
          console.warn('refreshUser: Server returned non-JSON response');
          if (retries > 0) {
            console.log(`Retrying refreshUser in 2s... (${retries} retries left)`);
            await new Promise(r => setTimeout(r, 2000));
            return refreshUser(retries - 1);
          }
        }
      } else if (res.status >= 500 && retries > 0) {
         console.warn(`refreshUser: Server error ${res.status}. Retrying in 2s...`);
         await new Promise(r => setTimeout(r, 2000));
         return refreshUser(retries - 1);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      if (retries > 0) {
        console.log(`Retrying refreshUser in 2s... (${retries} retries left)`);
        await new Promise(r => setTimeout(r, 2000));
        return refreshUser(retries - 1);
      }
    }
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, updateUser, loading }}>
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
