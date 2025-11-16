import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Importar componentes de las vistas existentes
import TabPostulaciones from '../components/TabPostulaciones';
import TabPool from '../components/TabPool';
import TabBusqueda from '../components/TabBusqueda';

export default function CentroCandidatos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('postulaciones');
  const [loading, setLoading] = useState(true);
  const [empresaData, setEmpresaData] = useState(null);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState({
    totalPostulaciones: 0,
    totalPool: 0,
    candidatosActivos: 0,
    candidatosEnProceso: 0
  });

  // Estados compartidos entre tabs
  const [candidatosData, setCandidatosData] = useState({
    postulaciones: [],
    pool: [],
    busqueda: []
  });

  useEffect(() => {
    if (user?.id) {
      cargarDatosIniciales();
    }
  }, [user?.id]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de empresa
      const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
      setEmpresaData(empresaResponse.data);

      // Cargar estadísticas generales
      await cargarEstadisticasGenerales(empresaResponse.data.id);
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticasGenerales = async (empresaId) => {
    try {
      // Cargar postulaciones de la empresa
      const postulacionesResponse = await api.get('/postulaciones');
      const todasPostulaciones = postulacionesResponse.data || [];
      const postulacionesEmpresa = todasPostulaciones.filter(
        p => p.busqueda_laboral?.empresa_id === empresaId
      );

      // Cargar pool de candidatos
      const poolResponse = await api.get('/pool-candidatos');
      const poolData = poolResponse.data.data?.data || [];

      // Calcular estadísticas
      setEstadisticasGenerales({
        totalPostulaciones: postulacionesEmpresa.length,
        totalPool: poolData.length,
        candidatosActivos: poolData.filter(p => p.estado_interno === 'activo').length,
        candidatosEnProceso: poolData.filter(p => p.estado_interno === 'en_proceso').length
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const actualizarCandidatos = (tab, datos) => {
    setCandidatosData(prev => ({
      ...prev,
      [tab]: datos
    }));
  };

  // Función para mover candidato de postulación a pool
  const moverCandidatoAPool = async (candidato, postulacionId) => {
    try {
      await api.post('/pool-candidatos/agregar-existente', {
        candidato_id: candidato.id,
        origen: 'postulacion',
        estado_interno: 'activo',
        notas_privadas: `Candidato agregado desde postulación ID: ${postulacionId}`,
        tags: ['postulacion']
      });

      // Recargar estadísticas
      if (empresaData) {
        await cargarEstadisticasGenerales(empresaData.id);
      }

      return { success: true };
    } catch (error) {
      console.error('Error moviendo candidato a pool:', error);
      return { success: false, error: error.message };
    }
  };

  const refrescarEstadisticas = async () => {
    if (empresaData) {
      await cargarEstadisticasGenerales(empresaData.id);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando Centro Candidatos...</span>
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
          <p>No se pudo cargar la información de tu empresa. Por favor, verifica tu perfil empresarial.</p>
          <button className="btn btn-primary" onClick={() => navigate('/configuracion-empresa')}>
            Ir a Configuración
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)' }}>
      <div className="container py-4">
        
        {/* Header con información de empresa */}
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

        {/* Dashboard de estadísticas */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="text-primary mb-2">
                  <i className="bi bi-inbox fs-2"></i>
                </div>
                <h4 className="fw-bold text-primary">{estadisticasGenerales.totalPostulaciones}</h4>
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
                <h4 className="fw-bold text-success">{estadisticasGenerales.totalPool}</h4>
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
                <h4 className="fw-bold text-warning">{estadisticasGenerales.candidatosActivos}</h4>
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
                <h4 className="fw-bold text-info">{estadisticasGenerales.candidatosEnProceso}</h4>
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
                  {estadisticasGenerales.totalPostulaciones > 0 && (
                    <span className="badge bg-primary ms-2">{estadisticasGenerales.totalPostulaciones}</span>
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
                  {estadisticasGenerales.totalPool > 0 && (
                    <span className="badge bg-success ms-2">{estadisticasGenerales.totalPool}</span>
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
            {/* Contenido de los tabs */}
            {activeTab === 'postulaciones' && (
              <TabPostulaciones 
                empresaData={empresaData}
                onMoverAPool={moverCandidatoAPool}
                candidatos={candidatosData.postulaciones}
                onUpdate={(datos) => actualizarCandidatos('postulaciones', datos)}
              />
            )}
            
            {activeTab === 'pool' && (
              <TabPool 
                empresaData={empresaData}
                candidatos={candidatosData.pool}
                onUpdate={(datos) => actualizarCandidatos('pool', datos)}
                onRefreshStats={refrescarEstadisticas}
              />
            )}
            
            {activeTab === 'busqueda' && (
              <TabBusqueda 
                empresaData={empresaData}
                onAgregarAPool={moverCandidatoAPool}
                candidatos={candidatosData.busqueda}
                onUpdate={(datos) => actualizarCandidatos('busqueda', datos)}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
