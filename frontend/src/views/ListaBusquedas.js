import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ListaBusquedas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [busquedas, setBusquedas] = useState([]);
  const [empresaData, setEmpresaData] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [actionLoading, setActionLoading] = useState(null);

  // Cargar búsquedas laborales de la empresa
  useEffect(() => {
    const loadBusquedas = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Cargando datos de empresa para usuario:', user.id);
        
        // Primero obtener datos de la empresa
        const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
        const empresa = empresaResponse.data;
        setEmpresaData(empresa);
        
        console.log('🏢 Empresa encontrada:', empresa);
        console.log('🆔 ID de empresa:', empresa.id);
        
        // Luego obtener TODAS las búsquedas laborales
        console.log('📋 Obteniendo todas las búsquedas laborales...');
        const busquedasResponse = await api.get('/busquedas-laborales');
        const todasBusquedas = busquedasResponse.data;
        
        console.log('📊 Total de búsquedas en sistema:', todasBusquedas.length);
        console.log('📋 Todas las búsquedas:', todasBusquedas);
        
        // Filtrar búsquedas de la empresa actual
        const busquedasEmpresa = todasBusquedas.filter(busqueda => {
          console.log(`🔍 Comparando búsqueda ${busqueda.id}: empresa_id=${busqueda.empresa_id} vs ${empresa.id}`);
          return parseInt(busqueda.empresa_id) === parseInt(empresa.id);
        });
        
        console.log('✅ Búsquedas filtradas para la empresa:', busquedasEmpresa.length);
        console.log('📋 Búsquedas de la empresa:', busquedasEmpresa);
        
        setBusquedas(busquedasEmpresa);
        
      } catch (err) {
        console.error('❌ Error al cargar búsquedas:', err);
        console.error('❌ Response data:', err.response?.data);
        console.error('❌ Response status:', err.response?.status);
        
        if (err.response?.status === 404) {
          setError('No se encontró el perfil de empresa. Complete su perfil primero.');
        } else {
          setError(`Error al cargar las búsquedas laborales: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadBusquedas();
  }, [user?.id]);

  // Filtrar búsquedas según estado seleccionado
  const busquedasFiltradas = busquedas.filter(busqueda => {
    if (filtroEstado === 'todas') return true;
    return busqueda.estado === filtroEstado;
  });

  // Función para cambiar estado de búsqueda
  const cambiarEstadoBusqueda = async (busquedaId, nuevoEstado) => {
    try {
      setActionLoading(busquedaId);
      await api.put(`/busquedas-laborales/${busquedaId}`, { estado: nuevoEstado });
      
      // Actualizar estado local
      setBusquedas(prev => prev.map(busqueda => 
        busqueda.id === busquedaId 
          ? { ...busqueda, estado: nuevoEstado }
          : busqueda
      ));
      
      setSuccess(`Estado de búsqueda actualizado a "${nuevoEstado}"`);
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error al cambiar el estado de la búsqueda');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  // Función para eliminar búsqueda
  const eliminarBusqueda = async (busquedaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta búsqueda laboral? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setActionLoading(busquedaId);
      await api.delete(`/busquedas-laborales/${busquedaId}`);
      
      // Remover de estado local
      setBusquedas(prev => prev.filter(busqueda => busqueda.id !== busquedaId));
      
      setSuccess('Búsqueda laboral eliminada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error al eliminar búsqueda:', err);
      setError('Error al eliminar la búsqueda laboral');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  // Función para obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierta': return 'success';
      case 'pausada': return 'warning';
      case 'cerrada': return 'danger';
      default: return 'secondary';
    }
  };

  // Función para obtener ícono según estado
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'abierta': return 'bi-play-circle-fill';
      case 'pausada': return 'bi-pause-circle-fill';
      case 'cerrada': return 'bi-stop-circle-fill';
      default: return 'bi-question-circle-fill';
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para calcular días restantes
  const calcularDiasRestantes = (fechaCierre) => {
    if (!fechaCierre) return null;
    
    const hoy = new Date();
    const cierre = new Date(fechaCierre);
    const diferencia = cierre.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
    
    return dias;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                <div className="card-body text-center p-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <h5>Cargando búsquedas laborales...</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        
        {/* Header */}
        <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)' }}>
                  <i className="bi bi-clipboard-data text-white" style={{ fontSize: '1.8rem' }}></i>
                </div>
                <div>
                  <h3 className="fw-bold text-white mb-1">Mis Búsquedas Laborales</h3>
                  <p className="text-white-50 mb-0">
                    {empresaData && `${empresaData.razon_social} • ${busquedas.length} búsquedas totales`}
                    {loading && ' • Cargando...'}
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-light btn-sm"
                  onClick={() => navigate('/crear-busqueda-laboral')}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Nueva Búsqueda
                </button>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={() => navigate('/empresa-dashboard')}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="alert alert-danger shadow-sm mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success shadow-sm mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </div>
        )}

        {/* Filtros y estadísticas */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-3">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <label htmlFor="filtroEstado" className="form-label fw-semibold mb-1">Filtrar por estado:</label>
                    <select
                      id="filtroEstado"
                      className="form-select"
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                      <option value="todas">🔍 Todas las búsquedas</option>
                      <option value="abierta">🟢 Abiertas</option>
                      <option value="pausada">🟡 Pausadas</option>
                      <option value="cerrada">🔴 Cerradas</option>
                    </select>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <small className="text-muted">
                      Mostrando {busquedasFiltradas.length} de {busquedas.length} búsquedas
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="col-md-4">
            <div className="row g-2">
              <div className="col-4">
                <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                  <div className="fw-bold text-success">{busquedas.filter(b => b.estado === 'abierta').length}</div>
                  <small className="text-muted">Abiertas</small>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center p-2 bg-warning bg-opacity-10 rounded">
                  <div className="fw-bold text-warning">{busquedas.filter(b => b.estado === 'pausada').length}</div>
                  <small className="text-muted">Pausadas</small>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center p-2 bg-danger bg-opacity-10 rounded">
                  <div className="fw-bold text-danger">{busquedas.filter(b => b.estado === 'cerrada').length}</div>
                  <small className="text-muted">Cerradas</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de búsquedas */}
        {busquedasFiltradas.length === 0 ? (
          <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <div className="card-body text-center p-5">
              <i className="bi bi-inbox text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted mb-3">
                {busquedas.length === 0 ? 'No tienes búsquedas laborales' : 'No hay búsquedas con este filtro'}
              </h5>
              <p className="text-muted mb-4">
                {busquedas.length === 0 
                  ? 'Comienza creando tu primera búsqueda laboral para atraer talento a tu empresa.'
                  : 'Prueba cambiando el filtro o creando una nueva búsqueda.'
                }
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/crear-busqueda-laboral')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Crear Primera Búsqueda
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {busquedasFiltradas.map((busqueda) => {
              const diasRestantes = calcularDiasRestantes(busqueda.fecha_cierre);
              
              return (
                <div key={busqueda.id} className="col-12">
                  <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
                    <div className="card-body p-4">
                      
                      {/* Header de la búsqueda */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <h5 className="fw-bold mb-2 text-primary">{busqueda.titulo}</h5>
                          <div className="d-flex align-items-center gap-3 mb-2">
                            <span className={`badge px-3 py-2 fw-semibold ${
                              busqueda.estado === 'abierta' 
                                ? 'bg-success text-white' 
                                : busqueda.estado === 'pausada'
                                ? 'bg-warning text-dark'
                                : 'bg-danger text-white'
                            }`}>
                              <i className={`bi ${getEstadoIcon(busqueda.estado)} me-1`}></i>
                              {busqueda.estado.charAt(0).toUpperCase() + busqueda.estado.slice(1)}
                            </span>
                            <small className="text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              Publicada: {formatearFecha(busqueda.fecha_publicacion)}
                            </small>
                            {busqueda.fecha_cierre && (
                              <small className={`${diasRestantes && diasRestantes < 7 ? 'text-danger' : 'text-muted'}`}>
                                <i className="bi bi-clock me-1"></i>
                                {diasRestantes !== null 
                                  ? diasRestantes > 0 
                                    ? `${diasRestantes} días restantes`
                                    : 'Vencida'
                                  : 'Sin fecha límite'
                                }
                              </small>
                            )}
                          </div>
                        </div>
                        
                        {/* Botones de acción simplificados */}
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => navigate(`/editar-busqueda-laboral/${busqueda.id}`)}
                            disabled={actionLoading === busqueda.id}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          
                          {busqueda.estado === 'abierta' && (
                            <button 
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => cambiarEstadoBusqueda(busqueda.id, 'pausada')}
                              disabled={actionLoading === busqueda.id}
                            >
                              {actionLoading === busqueda.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="bi bi-pause"></i>
                              )}
                            </button>
                          )}
                          
                          {busqueda.estado === 'pausada' && (
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => cambiarEstadoBusqueda(busqueda.id, 'abierta')}
                              disabled={actionLoading === busqueda.id}
                            >
                              {actionLoading === busqueda.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="bi bi-play"></i>
                              )}
                            </button>
                          )}
                          
                          {(busqueda.estado === 'abierta' || busqueda.estado === 'pausada') && (
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => cambiarEstadoBusqueda(busqueda.id, 'cerrada')}
                              disabled={actionLoading === busqueda.id}
                            >
                              {actionLoading === busqueda.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="bi bi-stop"></i>
                              )}
                            </button>
                          )}
                          
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => eliminarBusqueda(busqueda.id)}
                            disabled={actionLoading === busqueda.id}
                          >
                            {actionLoading === busqueda.id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <i className="bi bi-trash"></i>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="mb-3">
                        <p className="text-muted mb-2" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {busqueda.descripcion}
                        </p>
                      </div>

                      {/* Requisitos (si existen) */}
                      {busqueda.requisitos && (
                        <div className="mb-3">
                          <h6 className="fw-semibold text-secondary mb-2">
                            <i className="bi bi-list-check me-1"></i>
                            Requisitos principales:
                          </h6>
                          <div 
                            className="text-muted small"
                            style={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {busqueda.requisitos}
                          </div>
                        </div>
                      )}

                      {/* Footer con estadísticas */}
                      <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                        <div className="d-flex gap-3">
                          <small className="text-muted">
                            <i className="bi bi-eye me-1"></i>
                            {busqueda.postulaciones?.length || 0} postulaciones
                          </small>
                          <small className="text-muted">
                            <i className="bi bi-calendar-event me-1"></i>
                            Creada {formatearFecha(busqueda.created_at)}
                          </small>
                        </div>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/busqueda-detalle/${busqueda.id}`)}
                        >
                          Ver Detalle
                          <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
