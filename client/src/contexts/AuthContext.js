import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Auto-login if token exists
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      setToken(storedToken);
      getProfile()
        .then(profile => setUser(profile))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('jwt_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await apiLogin(credentials);
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('jwt_token', data.token);
      }
      setUser(data.user || data);
      localStorage.setItem('dirhaminc_user', JSON.stringify(data.user || data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('dirhaminc_user');
  };

  // Protected route HOC/component
  const ProtectedRoute = ({ children, fallback = null }) => {
    if (loading) return null;
    if (!user) return fallback || <div>Unauthorized</div>;
    return children;
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    ProtectedRoute,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 