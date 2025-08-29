import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function BusquedaDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar detalles de la búsqueda
      const busquedaResponse = await api.get(`/busquedas-laborales/${id}`);
      setBusqueda(busquedaResponse.data);

      // Cargar postulaciones de esta búsqueda
      const postulacionesResponse = await api.get('/postulaciones');
      const todasPostulaciones = postulacionesResponse.data;
      
      // Filtrar postulaciones para esta búsqueda específica
      const postulacionesBusqueda = todasPostulaciones.filter(
        p => p.busqueda_id === parseInt(id)
      );
      
      setPostulaciones(postulacionesBusqueda);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los detalles de la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'abierta': return 'bi-play-circle-fill';
      case 'pausada': return 'bi-pause-circle-fill';
      case 'cerrada': return 'bi-stop-circle-fill';
      default: return 'bi-circle-fill';
    }
  };

  const getEstadoPostulacion = (estado) => {
    switch(estado) {
      case 'pendiente': return { class: 'bg-warning text-dark', text: 'Pendiente' };
      case 'revisada': return { class: 'bg-info text-white', text: 'Revisada' };
      case 'aceptada': return { class: 'bg-success text-white', text: 'Aceptada' };
      case 'rechazada': return { class: 'bg-danger text-white', text: 'Rechazada' };
      default: return { class: 'bg-secondary text-white', text: 'Desconocido' };
    }
  };

  const postulacionesFiltradas = filtroEstado === 'todas' 
    ? postulaciones 
    : postulaciones.filter(p => p.estado === filtroEstado);

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando detalles de la búsqueda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/mis-busquedas-laborales')}>
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Mis Búsquedas
        </button>
      </div>
    );
  }

  if (!busqueda) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Búsqueda no encontrada
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/mis-busquedas-laborales')}>
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Mis Búsquedas
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)' }}>
                      <i className="bi bi-file-earmark-text text-white" style={{ fontSize: '1.8rem' }}></i>
                    </div>
                    <div>
                      <h3 className="fw-bold text-white mb-1">{busqueda.titulo}</h3>
                      <p className="text-white-50 mb-0">
                        <span className={`badge me-2 px-3 py-2 fw-semibold ${
                          busqueda.estado === 'abierta' 
                            ? 'bg-success' 
                            : busqueda.estado === 'pausada'
                            ? 'bg-warning text-dark'
                            : 'bg-danger'
                        }`}>
                          <i className={`bi ${getEstadoIcon(busqueda.estado)} me-1`}></i>
                          {busqueda.estado.charAt(0).toUpperCase() + busqueda.estado.slice(1)}
                        </span>
                        {postulaciones.length} postulaciones totales
                      </p>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-light btn-sm"
                      onClick={() => navigate(`/editar-busqueda-laboral/${busqueda.id}`)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Editar
                    </button>
                    <button 
                      className="btn btn-outline-light btn-sm"
                      onClick={() => navigate('/mis-busquedas-laborales')}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Volver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la búsqueda */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  Descripción de la Búsqueda
                </h5>
                <p className="text-muted mb-4" style={{ whiteSpace: 'pre-line' }}>
                  {busqueda.descripcion}
                </p>
                
                {busqueda.requisitos && (
                  <>
                    <h6 className="fw-semibold text-secondary mb-3">
                      <i className="bi bi-list-check me-2"></i>
                      Requisitos
                    </h6>
                    <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line' }}>
                      {busqueda.requisitos}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-calendar me-2"></i>
                  Información General
                </h6>
                
                <div className="mb-3">
                  <small className="text-muted d-block">Fecha de Publicación:</small>
                  <span className="fw-semibold">{formatearFecha(busqueda.fecha_publicacion)}</span>
                </div>
                
                {busqueda.fecha_cierre && (
                  <div className="mb-3">
                    <small className="text-muted d-block">Fecha de Cierre:</small>
                    <span className="fw-semibold">{formatearFecha(busqueda.fecha_cierre)}</span>
                  </div>
                )}
                
                <div className="mb-3">
                  <small className="text-muted d-block">Creada:</small>
                  <span className="fw-semibold">{formatearFecha(busqueda.created_at)}</span>
                </div>
                
                <div>
                  <small className="text-muted d-block">Última actualización:</small>
                  <span className="fw-semibold">{formatearFecha(busqueda.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Postulaciones */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-people me-2"></i>
                    Postulaciones ({postulaciones.length})
                  </h5>
                  
                  <select
                    className="form-select w-auto"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="todas">Todas las postulaciones</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="revisada">Revisadas</option>
                    <option value="aceptada">Aceptadas</option>
                    <option value="rechazada">Rechazadas</option>
                  </select>
                </div>

                {/* Estadísticas rápidas */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                      <div className="fw-bold text-warning h4">{postulaciones.filter(p => p.estado === 'pendiente').length}</div>
                      <small className="text-muted">Pendientes</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                      <div className="fw-bold text-info h4">{postulaciones.filter(p => p.estado === 'revisada').length}</div>
                      <small className="text-muted">Revisadas</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                      <div className="fw-bold text-success h4">{postulaciones.filter(p => p.estado === 'aceptada').length}</div>
                      <small className="text-muted">Aceptadas</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-danger bg-opacity-10 rounded">
                      <div className="fw-bold text-danger h4">{postulaciones.filter(p => p.estado === 'rechazada').length}</div>
                      <small className="text-muted">Rechazadas</small>
                    </div>
                  </div>
                </div>

                {/* Lista de postulaciones */}
                {postulacionesFiltradas.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h6 className="text-muted">No hay postulaciones con este filtro</h6>
                  </div>
                ) : (
                  <div className="row g-3">
                    {postulacionesFiltradas.map((postulacion) => {
                      const estadoInfo = getEstadoPostulacion(postulacion.estado);
                      
                      return (
                        <div key={postulacion.id} className="col-12">
                          <div className="card border-0 shadow-sm">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="d-flex align-items-center">
                                  <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                                    <i className="bi bi-person-fill text-primary"></i>
                                  </div>
                                  <div>
                                    <h6 className="fw-bold mb-1">
                                      {postulacion.candidato?.nombre} {postulacion.candidato?.apellido}
                                    </h6>
                                    <p className="text-muted mb-1 small">
                                      <i className="bi bi-envelope me-1"></i>
                                      {postulacion.candidato?.email}
                                    </p>
                                    <small className="text-muted">
                                      <i className="bi bi-calendar me-1"></i>
                                      Postulado: {formatearFecha(postulacion.created_at)}
                                    </small>
                                  </div>
                                </div>
                                
                                <div className="d-flex align-items-center gap-2">
                                  <span className={`badge px-3 py-2 ${estadoInfo.class}`}>
                                    {estadoInfo.text}
                                  </span>
                                  <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => navigate(`/candidatos/${postulacion.candidato.id}`)}
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    Ver Perfil
                                  </button>
                                </div>
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
          </div>
        </div>

      </div>
    </div>
  );
}
