import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in local storage
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user data
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          if (err.response && err.response.status === 401) {
            localStorage.removeItem('token');
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, isAdminLogin = false) => {
    const url = isAdminLogin ? '/auth/admin-login' : '/auth/login';
    const res = await api.post(url, { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
