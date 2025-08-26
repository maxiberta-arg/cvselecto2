import React, { createContext, useState, useContext } from 'react';

// Contexto de autenticación y rol
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, nombre, rol }
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulación de login (reemplazar por llamada a API)
  const login = (usuario, rol) => {
    setUser({ nombre: usuario, rol });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
