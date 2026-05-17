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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
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

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) return;

    try {
      const res = await fetch('http://localhost:5000/api/profile/me', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const freshUser = await res.json();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading }}>
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
