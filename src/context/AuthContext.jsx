import React, { createContext, useContext, useState, useCallback } from 'react';
import usersData from '../data/users.json';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const login = useCallback((userId) => {
    const found = usersData.find(u => u.id === userId);
    if (found) {
      setUser(found);
      setError('');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
