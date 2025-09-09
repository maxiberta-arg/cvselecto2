import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import evaluacionService from '../services/evaluacionService';
import SectionTitle from '../components/SectionTitle';

const EvaluacionesCandidato = () => {
  const { candidatoId } = useParams();
  const navigate = useNavigate();
  
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [candidato, setCandidato] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (candidatoId) {
      cargarEvaluacionesCandidato();
    }
  }, [candidatoId]);

  const cargarEvaluacionesCandidato = async () => {
    try {
      setLoading(true);
      const response = await evaluacionService.obtenerEvaluacionesPorCandidato(candidatoId);
      
      if (response.success) {
        setEvaluaciones(response.data);
        setEstadisticas(response.meta);
        
        // Obtener información del candidato del primer resultado
        if (response.data.length > 0) {
          setCandidato(response.data[0].candidato);
        }
      } else {
        setError('No se pudieron cargar las evaluaciones del candidato');
      }
    } catch (err) {
      console.error('Error al cargar evaluaciones del candidato:', err);
      setError(err.message || 'Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const crearNuevaEvaluacion = () => {
    navigate(`/crear-evaluacion?candidato=${candidatoId}`);
  };

  const getEstadoBadgeClass = (estado) => {
    const clases = {
      'pendiente': 'bg-warning text-dark',
      'en_progreso': 'bg-info text-white',
      'completada': 'bg-success text-white'
    };
    return clases[estado] || 'bg-secondary text-white';
  };

  const getTipoEvaluacionIcon = (tipo) => {
    const iconos = {
      'tecnica': 'fa-code',
      'comportamental': 'fa-users',
      'cultural': 'fa-heart',
      'entrevista': 'fa-comments',
      'referencia': 'fa-phone',
      'integral': 'fa-chart-pie'
    };
    return iconos[tipo] || 'fa-clipboard';
  };

  const getTipoEvaluacionColor = (tipo) => {
    const colores = {
      'tecnica': 'primary',
      'comportamental': 'info',
      'cultural': 'warning',
      'entrevista': 'success',
      'referencia': 'secondary',
      'integral': 'danger'
    };
    return colores[tipo] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando evaluaciones del candidato...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={cargarEvaluacionesCandidato}>
            Reintentar
          </button>
          <button className="btn btn-secondary ms-2" onClick={() => navigate('/centro-evaluacion')}>
            Volver al Centro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <SectionTitle 
            title={candidato ? `Evaluaciones de ${candidato.nombre} ${candidato.apellido}` : 'Evaluaciones del Candidato'} 
            subtitle="Historial completo de evaluaciones realizadas"
          />
        </div>
      </div>

      {/* Información del candidato */}
      {candidato && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="avatar-lg me-3">
                        <div className="avatar-title bg-primary rounded-circle">
                          {candidato.nombre.charAt(0)}{candidato.apellido.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h5 className="mb-1">{candidato.nombre} {candidato.apellido}</h5>
                        <p className="text-muted mb-1">{candidato.email}</p>
                        {candidato.telefono && (
                          <p className="text-muted mb-0">{candidato.telefono}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row text-center">
                      <div className="col-3">
                        <div className="border-end">
                          <h4 className="text-primary">{estadisticas?.total_evaluaciones || 0}</h4>
                          <small className="text-muted">Total</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border-end">
                          <h4 className="text-success">{estadisticas?.evaluaciones_completadas || 0}</h4>
                          <small className="text-muted">Completadas</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border-end">
                          <h4 className="text-info">
                            {estadisticas?.promedio_puntuacion ? 
                              estadisticas.promedio_puntuacion.toFixed(1) : 
                              '-'
                            }
                          </h4>
                          <small className="text-muted">Promedio</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <h4 className="text-warning">{candidato.experiencia_anos || 0}</h4>
                        <small className="text-muted">Años Exp.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <button 
                className="btn btn-outline-secondary me-2"
                onClick={() => navigate('/centro-evaluacion')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Volver al Centro
              </button>
            </div>
            <div>
              <button 
                className="btn btn-primary"
                onClick={crearNuevaEvaluacion}
              >
                <i className="fas fa-plus me-2"></i>
                Nueva Evaluación
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de evaluaciones */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-list me-2"></i>
                Historial de Evaluaciones
              </h5>
            </div>
            <div className="card-body">
              {evaluaciones.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No hay evaluaciones para este candidato</h5>
                  <p className="text-muted">Comience creando la primera evaluación</p>
                  <button 
                    className="btn btn-primary"
                    onClick={crearNuevaEvaluacion}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Crear Primera Evaluación
                  </button>
                </div>
              ) : (
                <div className="row">
                  {evaluaciones.map(evaluacion => (
                    <div key={evaluacion.id} className="col-xl-4 col-lg-6 mb-4">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-header bg-transparent border-0 pb-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-center">
                              <div className={`avatar-sm me-2 bg-${getTipoEvaluacionColor(evaluacion.tipo_evaluacion)} rounded-circle d-flex align-items-center justify-content-center`}>
                                <i className={`fas ${getTipoEvaluacionIcon(evaluacion.tipo_evaluacion)} text-white`}></i>
                              </div>
                              <div>
                                <span className="badge bg-secondary">
                                  {evaluacion.tipo_evaluacion_label}
                                </span>
                              </div>
                            </div>
                            <span className={`badge ${getEstadoBadgeClass(evaluacion.estado_evaluacion)}`}>
                              {evaluacion.estado_evaluacion_label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="card-body">
                          <h6 className="card-title">{evaluacion.nombre_evaluacion}</h6>
                          
                          {/* Progreso */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">Progreso</small>
                              <small className="fw-bold">{evaluacion.progreso.porcentaje}%</small>
                            </div>
                            <div className="progress" style={{height: '6px'}}>
                              <div 
                                className="progress-bar" 
                                style={{width: `${evaluacion.progreso.porcentaje}%`}}
                              ></div>
                            </div>
                          </div>

                          {/* Puntuación */}
                          {evaluacion.puntuacion_total !== null && (
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Puntuación Total:</span>
                                <span className="h5 text-primary mb-0">
                                  {evaluacion.puntuacion_total.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Fechas */}
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              <i className="fas fa-calendar me-1"></i>
                              Creada: {evaluacion.fecha_creacion}
                            </small>
                            {evaluacion.fecha_completada && (
                              <small className="text-muted d-block">
                                <i className="fas fa-check-circle me-1"></i>
                                Completada: {evaluacion.fecha_completada}
                              </small>
                            )}
                          </div>

                          {/* Comentarios preview */}
                          {evaluacion.comentarios_generales && (
                            <div className="mb-3">
                              <small className="text-muted">Comentarios:</small>
                              <p className="small text-truncate mb-0">
                                {evaluacion.comentarios_generales}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="card-footer bg-transparent border-0">
                          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/evaluacion/${evaluacion.id}`)}
                            >
                              <i className="fas fa-eye me-1"></i>
                              Ver Detalle
                            </button>
                            {evaluacion.estado_evaluacion !== 'completada' && (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => navigate(`/evaluacion/${evaluacion.id}/editar`)}
                              >
                                <i className="fas fa-edit me-1"></i>
                                Editar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen estadístico */}
      {evaluaciones.length > 0 && estadisticas && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  Resumen de Rendimiento
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 text-center">
                    <div className="border-end">
                      <h4 className="text-primary">
                        {((estadisticas.evaluaciones_completadas / estadisticas.total_evaluaciones) * 100).toFixed(1)}%
                      </h4>
                      <small className="text-muted">Tasa de Completitud</small>
                    </div>
                  </div>
                  <div className="col-md-3 text-center">
                    <div className="border-end">
                      <h4 className="text-success">
                        {evaluaciones.filter(e => e.puntuacion_total >= 70).length}
                      </h4>
                      <small className="text-muted">Evaluaciones Exitosas (≥70)</small>
                    </div>
                  </div>
                  <div className="col-md-3 text-center">
                    <div className="border-end">
                      <h4 className="text-info">
                        {evaluaciones.reduce((acc, e) => acc + (e.progreso.total_criterios || 0), 0)}
                      </h4>
                      <small className="text-muted">Total Criterios Evaluados</small>
                    </div>
                  </div>
                  <div className="col-md-3 text-center">
                    <h4 className="text-warning">
                      {new Set(evaluaciones.map(e => e.tipo_evaluacion)).size}
                    </h4>
                    <small className="text-muted">Tipos de Evaluación</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluacionesCandidato;
