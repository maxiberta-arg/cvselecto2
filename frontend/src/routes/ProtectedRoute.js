import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente para proteger rutas según autenticación y rol
export default function ProtectedRoute({ children, rol }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (rol && user?.rol !== rol) {
    return <Navigate to="/" />;
  }
  return children;
}
