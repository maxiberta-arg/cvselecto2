import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../views/Home';
import CandidatoDashboard from '../views/CandidatoDashboard';
import EmpresaDashboard from '../views/EmpresaDashboard';
import AdminDashboard from '../views/AdminDashboard';
import PerfilCandidatoMejorado from '../views/PerfilCandidatoMejorado';
import PerfilEmpresa from '../views/PerfilEmpresa';
import PerfilAdmin from '../views/PerfilAdmin';
import CrearBusquedaLaboral from '../views/CrearBusquedaLaboral';
import ListaBusquedas from '../views/ListaBusquedas';
import EditarBusquedaLaboral from '../views/EditarBusquedaLaboral';
import AgregarCandidatoManual from '../views/AgregarCandidatoManual';
import GestionCandidatos from '../views/GestionCandidatos';
import ReportesEmpresa from '../views/ReportesEmpresa';
import ConfiguracionEmpresa from '../views/ConfiguracionEmpresa';
import Login from '../views/Login';
import Navbar from '../components/Navbar';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PerfilEditProvider } from '../context/PerfilEditContext';

// Componente interno para manejar rutas con loading
function AppContent() {
  const { loading } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* Mostrar Navbar solo si no estamos en Home o Login */}
      {!['/', '/login'].includes(window.location.pathname) && <Navbar />}
      <div className={['/', '/login'].includes(window.location.pathname) ? 'no-navbar' : ''}>
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
              <PerfilCandidatoMejorado />
            </ProtectedRoute>
          } />
          <Route path="/perfil-empresa" element={
            <ProtectedRoute rol="empresa">
              <PerfilEmpresa />
            </ProtectedRoute>
          } />
          <Route path="/perfil-admin" element={
            <ProtectedRoute rol="admin">
              <PerfilAdmin />
            </ProtectedRoute>
          } />
          <Route path="/empresa" element={
            <ProtectedRoute rol="empresa">
              <EmpresaDashboard />
            </ProtectedRoute>
          } />
          <Route path="/crear-busqueda-laboral" element={
            <ProtectedRoute rol="empresa">
              <CrearBusquedaLaboral />
            </ProtectedRoute>
          } />
          <Route path="/mis-busquedas-laborales" element={
            <ProtectedRoute rol="empresa">
              <ListaBusquedas />
            </ProtectedRoute>
          } />
          <Route path="/editar-busqueda-laboral/:id" element={
            <ProtectedRoute rol="empresa">
              <EditarBusquedaLaboral />
            </ProtectedRoute>
          } />
          <Route path="/agregar-candidato-manual/:busquedaId" element={
            <ProtectedRoute rol="empresa">
              <AgregarCandidatoManual />
            </ProtectedRoute>
          } />
          <Route path="/gestion-candidatos" element={
            <ProtectedRoute rol="empresa">
              <GestionCandidatos />
            </ProtectedRoute>
          } />
          <Route path="/reportes-empresa" element={
            <ProtectedRoute rol="empresa">
              <ReportesEmpresa />
            </ProtectedRoute>
          } />
          <Route path="/configuracion-empresa" element={
            <ProtectedRoute rol="empresa">
              <ConfiguracionEmpresa />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute rol="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

// Rutas principales de la app con navegación y protección por rol
export default function AppRoutes() {
  return (
    <PerfilEditProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PerfilEditProvider>
  );
}
