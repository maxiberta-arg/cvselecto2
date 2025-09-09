import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../views/Home';
import CandidatoDashboard from '../views/CandidatoDashboard';
import EmpresaDashboard from '../views/EmpresaDashboard';
import AdminDashboard from '../views/AdminDashboard';
import AdminCandidatos from '../views/AdminCandidatos';
import PerfilCandidatoMejorado from '../views/PerfilCandidatoMejorado';
import PerfilEmpresaRedirect from '../views/PerfilEmpresaRedirect';
import PerfilAdmin from '../views/PerfilAdmin';
import CrearBusquedaLaboral from '../views/CrearBusquedaLaboral';
import ListaBusquedas from '../views/ListaBusquedas';
import EditarBusquedaLaboral from '../views/EditarBusquedaLaboral';
import BusquedaDetalle from '../views/BusquedaDetalle';
import AgregarCandidatoManual from '../views/AgregarCandidatoManual';
import EditarCandidato from '../components/EditarCandidato';
import GestionCandidatos from '../views/GestionCandidatos';
import PoolCandidatos from '../views/PoolCandidatos';
import BusquedaCandidatos from '../views/BusquedaCandidatos';
import CentroCandidatos from '../views/CentroCandidatos';
import CentroGestionCandidatos from '../views/CentroGestionCandidatos';
import ReportesEmpresa from '../views/ReportesEmpresa';
import ConfiguracionEmpresa from '../views/ConfiguracionEmpresa';
import Login from '../views/Login';
import Register from '../views/Register';
import Navbar from '../components/Navbar';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PerfilEditProvider } from '../context/PerfilEditContext';

// Componentes de Evaluación
import CentroEvaluacion from '../views/CentroEvaluacion';
import CrearEvaluacion from '../views/CrearEvaluacionNuevo';
import DetalleEvaluacion from '../views/DetalleEvaluacion';
import EvaluacionesCandidato from '../views/EvaluacionesCandidato';

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
      {!['/', '/login', '/register'].includes(window.location.pathname) && <Navbar />}
      <div className={['/', '/login', '/register'].includes(window.location.pathname) ? 'no-navbar' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
              <PerfilEmpresaRedirect />
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
          <Route path="/busqueda-detalle/:id" element={
            <ProtectedRoute rol="empresa">
              <BusquedaDetalle />
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
          <Route path="/centro-gestion" element={
            <ProtectedRoute rol="empresa">
              <CentroGestionCandidatos />
            </ProtectedRoute>
          } />
          <Route path="/empresa/centro-candidatos" element={
            <ProtectedRoute rol="empresa">
              <CentroCandidatos />
            </ProtectedRoute>
          } />
          <Route path="/empresa/candidatos/editar/:id" element={
            <ProtectedRoute rol="empresa">
              <EditarCandidato />
            </ProtectedRoute>
          } />
          <Route path="/pool-candidatos" element={
            <ProtectedRoute rol="empresa">
              <PoolCandidatos />
            </ProtectedRoute>
          } />
          <Route path="/busqueda-candidatos" element={
            <ProtectedRoute rol="empresa">
              <BusquedaCandidatos />
            </ProtectedRoute>
          } />
          <Route path="/candidatos/:id" element={
            <ProtectedRoute rol="empresa">
              <PerfilCandidatoMejorado />
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
          
          {/* Rutas de Evaluaciones */}
          <Route path="/centro-evaluacion" element={
            <ProtectedRoute rol="empresa">
              <CentroEvaluacion />
            </ProtectedRoute>
          } />
          <Route path="/crear-evaluacion" element={
            <ProtectedRoute rol="empresa">
              <CrearEvaluacion />
            </ProtectedRoute>
          } />
          <Route path="/evaluacion/:id" element={
            <ProtectedRoute rol="empresa">
              <DetalleEvaluacion />
            </ProtectedRoute>
          } />
          <Route path="/evaluacion/:id/editar" element={
            <ProtectedRoute rol="empresa">
              <CrearEvaluacion />
            </ProtectedRoute>
          } />
          <Route path="/evaluaciones/candidato/:candidatoId" element={
            <ProtectedRoute rol="empresa">
              <EvaluacionesCandidato />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute rol="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-candidatos" element={
            <ProtectedRoute rol="admin">
              <AdminCandidatos />
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
