import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../views/Home';
import CandidatoDashboard from '../views/CandidatoDashboard';
import EmpresaDashboard from '../views/EmpresaDashboard';
import AdminDashboard from '../views/AdminDashboard';
import PerfilCandidato from '../views/PerfilCandidato';
import PerfilEmpresa from '../views/PerfilEmpresa';
import Login from '../views/Login';
import Navbar from '../components/Navbar';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// Rutas principales de la app con navegación y protección por rol
export default function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        {/* Mostrar Navbar solo si no estamos en Home */}
        {window.location.pathname !== '/' && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/candidato" element={
            <ProtectedRoute rol="candidato">
              <CandidatoDashboard />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute rol="candidato">
              <PerfilCandidato />
            </ProtectedRoute>
          } />
            <Route path="/perfil-empresa" element={
              <ProtectedRoute rol="empresa">
                <PerfilEmpresa />
              </ProtectedRoute>
            } />
          <Route path="/empresa" element={
            <ProtectedRoute rol="empresa">
              <EmpresaDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute rol="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
