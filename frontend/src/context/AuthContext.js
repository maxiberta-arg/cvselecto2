import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Contexto de autenticación y rol
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un usuario autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          // Verificar que el token aún sea válido
          const response = await api.get('/user');
          const user = JSON.parse(userData);
          setUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token inválido, limpiar datos
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login usando API real
  const login = async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      const { user, token } = response.data;
      
      // Guardar token y datos del usuario
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Error de autenticación';
      return { success: false, error: message };
    }
  };

  // Register usando API real
  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      const { user, token } = response.data;
      
      // Guardar token y datos del usuario
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Error en el registro';
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Incluso si falla el logout en el servidor, limpiamos localmente
      console.warn('Error al hacer logout en el servidor:', error);
    }
    
    // Limpiar datos locales
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Actualizar información del usuario
  const updateUserInfo = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
