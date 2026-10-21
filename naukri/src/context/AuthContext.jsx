import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('hiresphere_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest('/auth/me');
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('hiresphere_token');
        }
      } catch (err) {
        console.warn('Failed to restore session:', err.message);
        localStorage.removeItem('hiresphere_token');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (data.token) {
      localStorage.setItem('hiresphere_token', data.token);
      // Fetch full profile
      const meData = await apiRequest('/auth/me');
      setUser(meData.user || data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });

    if (data.token) {
      localStorage.setItem('hiresphere_token', data.token);
      const meData = await apiRequest('/auth/me');
      setUser(meData.user || data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hiresphere_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await apiRequest('/auth/me');
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.warn('Could not refresh user:', err.message);
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
