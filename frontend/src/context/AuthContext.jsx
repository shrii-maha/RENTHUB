import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if there's a valid session (token in localStorage or cookie)
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');

      // No token at all - skip the /me call
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        console.warn('[AUTH] Session check failed:', err.response?.data?.error || err.message);
        // Clear stale token
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login — stores token in both localStorage (for Bearer header) & cookie (HttpOnly from server)
  const login = async (email, password, isAdminLogin = false) => {
    const url = isAdminLogin ? '/auth/admin-login' : '/auth/login';
    const res = await api.post(url, { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Register — same as login after success
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Logout — clear localStorage token and cookie via backend
  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      // Don't block logout if the API call fails
      console.warn('[AUTH] Logout API call failed:', err.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
