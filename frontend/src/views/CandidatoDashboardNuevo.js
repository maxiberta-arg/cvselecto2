import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CandidatoDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [candidatoData, setCandidatoData] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatosCompletos();
  }, [user?.id]);

  const cargarDatosCompletos = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar datos del candidato
      const candidatoResponse = await api.get(`/candidatos/by-user/${user.id}`);
      const candidato = candidatoResponse.data;
      setCandidatoData(candidato);

      // Cargar postulaciones del candidato
      if (candidato.postulaciones) {
        setPostulaciones(candidato.postulaciones);
        
        // Calcular estadísticas
        const stats = {
          total: candidato.postulaciones.length,
          postulado: candidato.postulaciones.filter(p => p.estado === 'postulado').length,
          en_revision: candidato.postulaciones.filter(p => p.estado === 'en_revision').length,
          entrevista: candidato.postulaciones.filter(p => p.estado === 'entrevista').length,
          aceptado: candidato.postulaciones.filter(p => p.estado === 'aceptado').length,
          rechazado: candidato.postulaciones.filter(p => p.estado === 'rechazado').length,
        };
        setEstadisticas(stats);
      }

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar la información del candidato');
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular completitud del perfil
  const calcularCompletitud = () => {
    if (!candidatoData) return 0;
    
    const camposImportantes = [
      candidatoData.user?.name,
      candidatoData.apellido,
      candidatoData.telefono,
      candidatoData.bio,
      candidatoData.habilidades,
      candidatoData.experiencia_resumida,
      candidatoData.educacion_resumida
    ];
    
    const camposCompletos = camposImportantes.filter(campo => campo?.trim()).length;
    return Math.round((camposCompletos / camposImportantes.length) * 100);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'postulado': 'bg-primary',
      'en_revision': 'bg-warning',
      'entrevista': 'bg-info',
      'aceptado': 'bg-success',
      'rechazado': 'bg-danger'
    };
    return badges[estado] || 'bg-secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'postulado': 'Postulado',
      'en_revision': 'En revisión',
      'entrevista': 'Entrevista',
      'aceptado': 'Aceptado',
      'rechazado': 'Rechazado'
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando tu dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header de bienvenida */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="fw-bold mb-2">
                      ¡Hola, {candidatoData?.user?.name || 'Candidato'}! 👋
                    </h2>
                    <p className="mb-1 opacity-90">
                      Bienvenido a tu panel de candidato. Aquí puedes gestionar tus postulaciones y perfil profesional.
                    </p>
                    <small className="opacity-75">
                      Última conexión: {new Date().toLocaleDateString('es-AR')}
                    </small>
                  </div>
                  <div className="col-md-4 text-center">
                    <div className="d-inline-block p-3 bg-white bg-opacity-20 rounded-circle">
                      <i className="bi bi-person-workspace" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de completitud del perfil */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h6 className="fw-bold mb-2">
                      <i className="bi bi-person-check me-2"></i>
                      Completitud de tu Perfil
                    </h6>
                    <p className="text-muted mb-2">
                      Un perfil completo aumenta tus posibilidades de ser contactado por empresas.
                    </p>
                    <div className="progress mb-2" style={{ height: '8px' }}>
                      <div 
                        className={`progress-bar ${calcularCompletitud() >= 80 ? 'bg-success' : calcularCompletitud() >= 50 ? 'bg-warning' : 'bg-danger'}`}
                        role="progressbar" 
                        style={{ width: `${calcularCompletitud()}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">{calcularCompletitud()}% completado</small>
                  </div>
                  <div className="col-md-4 text-center">
                    {calcularCompletitud() < 100 && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/perfil')}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Completar Perfil
                      </button>
                    )}
                    {calcularCompletitud() === 100 && (
                      <div className="text-success">
                        <i className="bi bi-check-circle fs-1"></i>
                        <div className="mt-2">¡Perfil completo!</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de postulaciones */}
        <div className="row mb-4">
          <div className="col-md-2 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-3">
                <div className="text-primary mb-2">
                  <i className="bi bi-send fs-2"></i>
                </div>
                <h4 className="fw-bold mb-1">{estadisticas.total || 0}</h4>
                <small className="text-muted">Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-3">
                <div className="text-warning mb-2">
                  <i className="bi bi-clock fs-2"></i>
                </div>
                <h4 className="fw-bold mb-1">{estadisticas.en_revision || 0}</h4>
                <small className="text-muted">En Revisión</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-3">
                <div className="text-info mb-2">
                  <i className="bi bi-person-video fs-2"></i>
                </div>
                <h4 className="fw-bold mb-1">{estadisticas.entrevista || 0}</h4>
                <small className="text-muted">Entrevistas</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-3">
                <div className="text-success mb-2">
                  <i className="bi bi-check-circle fs-2"></i>
                </div>
                <h4 className="fw-bold mb-1">{estadisticas.aceptado || 0}</h4>
                <small className="text-muted">Aceptadas</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center p-3">
                <div className="text-danger mb-2">
                  <i className="bi bi-x-circle fs-2"></i>
                </div>
                <h4 className="fw-bold mb-1">{estadisticas.rechazado || 0}</h4>
                <small className="text-muted">Rechazadas</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 mb-3">
            <div className="card h-100 border-0 shadow-sm bg-primary text-white">
              <div className="card-body text-center p-3">
                <div className="mb-2">
                  <i className="bi bi-plus-circle fs-2"></i>
                </div>
                <h6 className="fw-bold mb-1">Buscar</h6>
                <small className="opacity-75">Nuevas Ofertas</small>
              </div>
            </div>
          </div>
        </div>

        {/* Postulaciones recientes */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-briefcase me-2"></i>
                    Mis Postulaciones
                  </h5>
                  <small className="text-muted">
                    {postulaciones.length} postulación{postulaciones.length !== 1 ? 'es' : ''}
                  </small>
                </div>
              </div>
              <div className="card-body p-0">
                {postulaciones.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                    <h5 className="text-muted mt-3">No tienes postulaciones aún</h5>
                    <p className="text-muted">¡Comienza a postularte a ofertas de trabajo!</p>
                    <button className="btn btn-primary">
                      <i className="bi bi-search me-2"></i>
                      Explorar Ofertas
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Empresa</th>
                          <th>Puesto</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                          <th>Puntuación</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {postulaciones.map((postulacion) => (
                          <tr key={postulacion.id}>
                            <td>
                              <div className="fw-semibold">
                                {postulacion.busqueda_laboral?.empresa?.nombre_empresa || 'Empresa'}
                              </div>
                              <small className="text-muted">
                                {postulacion.busqueda_laboral?.empresa?.ubicacion || ''}
                              </small>
                            </td>
                            <td>
                              <div className="fw-semibold">
                                {postulacion.busqueda_laboral?.titulo || 'Sin título'}
                              </div>
                              <small className="text-muted">
                                {postulacion.busqueda_laboral?.modalidad || ''}
                              </small>
                            </td>
                            <td>
                              <span className={`badge ${getEstadoBadge(postulacion.estado)}`}>
                                {getEstadoTexto(postulacion.estado)}
                              </span>
                            </td>
                            <td>
                              <small>
                                {new Date(postulacion.created_at).toLocaleDateString('es-AR')}
                              </small>
                            </td>
                            <td>
                              {postulacion.puntuacion ? (
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    {[...Array(5)].map((_, i) => (
                                      <i 
                                        key={i}
                                        className={`bi bi-star${i < postulacion.puntuacion ? '-fill text-warning' : ' text-muted'}`}
                                      ></i>
                                    ))}
                                  </div>
                                  <small className="text-muted">({postulacion.puntuacion}/5)</small>
                                </div>
                              ) : (
                                <span className="text-muted">Sin calificar</span>
                              )}
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/busqueda-detalle/${postulacion.busqueda_laboral?.id}`)}
                                title="Ver detalles"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
