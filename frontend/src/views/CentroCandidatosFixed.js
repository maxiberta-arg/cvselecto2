import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function CentroCandidatos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('postulaciones');
  const [loading, setLoading] = useState(true);
  const [empresaData, setEmpresaData] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalPostulaciones: 0,
    totalPool: 0,
    candidatosActivos: 0,
    candidatosEnProceso: 0
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }
        
        // Cargar datos de empresa
        const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
        setEmpresaData(empresaResponse.data);
        
        // Cargar estadísticas básicas
        try {
          const postulacionesResponse = await api.get('/postulaciones');
          const poolResponse = await api.get('/pool-candidatos');
          
          setEstadisticas({
            totalPostulaciones: postulacionesResponse.data?.length || 0,
            totalPool: poolResponse.data?.data?.data?.length || 0,
            candidatosActivos: 0,
            candidatosEnProceso: 0
          });
        } catch (statError) {
          console.warn('Error cargando estadísticas:', statError);
        }
        
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando Centro de Candidatos...</h5>
        </div>
      </div>
    );
  }

  if (!empresaData) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4 className="alert-heading">Empresa no encontrada</h4>
          <p>No se pudo cargar la información de tu empresa.</p>
          <button className="btn btn-primary" onClick={() => navigate('/empresa')}>
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)' }}>
      <div className="container py-4">
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold text-primary mb-1">
                  <i className="bi bi-grid-3x3-gap me-2"></i>
                  Centro de Candidatos
                </h2>
                <p className="text-muted mb-0">
                  Gestión unificada de candidatos para {empresaData.razon_social}
                </p>
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/empresa')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="text-primary mb-2">
                  <i className="bi bi-inbox fs-2"></i>
                </div>
                <h4 className="fw-bold text-primary">{estadisticas.totalPostulaciones}</h4>
                <p className="text-muted mb-0">Total Postulaciones</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="text-success mb-2">
                  <i className="bi bi-collection fs-2"></i>
                </div>
                <h4 className="fw-bold text-success">{estadisticas.totalPool}</h4>
                <p className="text-muted mb-0">En Mi Pool</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="text-warning mb-2">
                  <i className="bi bi-person-check fs-2"></i>
                </div>
                <h4 className="fw-bold text-warning">{estadisticas.candidatosActivos}</h4>
                <p className="text-muted mb-0">Candidatos Activos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="text-info mb-2">
                  <i className="bi bi-hourglass-split fs-2"></i>
                </div>
                <h4 className="fw-bold text-info">{estadisticas.candidatosEnProceso}</h4>
                <p className="text-muted mb-0">En Proceso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por tabs */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'postulaciones' ? 'active' : ''}`}
                  onClick={() => setActiveTab('postulaciones')}
                >
                  <i className="bi bi-inbox me-2"></i>
                  Postulaciones Recibidas
                  {estadisticas.totalPostulaciones > 0 && (
                    <span className="badge bg-primary ms-2">{estadisticas.totalPostulaciones}</span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'pool' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pool')}
                >
                  <i className="bi bi-collection me-2"></i>
                  Mi Pool Privado
                  {estadisticas.totalPool > 0 && (
                    <span className="badge bg-success ms-2">{estadisticas.totalPool}</span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'busqueda' ? 'active' : ''}`}
                  onClick={() => setActiveTab('busqueda')}
                >
                  <i className="bi bi-search me-2"></i>
                  Buscar Candidatos
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body">
            {/* Contenido simplificado pero funcional */}
            {activeTab === 'postulaciones' && (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                <h5 className="text-muted">Gestión de Postulaciones</h5>
                <p className="text-muted">Aquí podrás ver y gestionar todas las postulaciones recibidas.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/gestion-candidatos')}
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    Ir a Gestión Completa
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Actualizar
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'pool' && (
              <div className="text-center py-5">
                <i className="bi bi-collection display-1 text-muted mb-3"></i>
                <h5 className="text-muted">Mi Pool Privado</h5>
                <p className="text-muted">Tienes {estadisticas.totalPool} candidatos en tu pool privado.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-success"
                    onClick={() => navigate('/pool-candidatos')}
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    Ver Pool Completo
                  </button>
                  <button 
                    className="btn btn-outline-success"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Actualizar
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'busqueda' && (
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted mb-3"></i>
                <h5 className="text-muted">Buscar Candidatos</h5>
                <p className="text-muted">Busca y filtra candidatos para agregar a tu pool privado.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-info"
                    onClick={() => navigate('/busqueda-candidatos')}
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    Iniciar Búsqueda
                  </button>
                  <button 
                    className="btn btn-outline-info"
                    onClick={() => navigate('/agregar-candidato-manual/new')}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Agregar Manualmente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CentroCandidatos;
