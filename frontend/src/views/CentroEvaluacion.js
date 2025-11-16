import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import evaluacionService from '../services/evaluacionService';
import SectionTitle from '../components/SectionTitle';

const CentroEvaluacion = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [candidatosParaEvaluar, setCandidatosParaEvaluar] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    tipo_evaluacion: '',
    estado_evaluacion: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  // Estados de paginación
  const [paginacion, setPaginacion] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });

  const [vistaActual, setVistaActual] = useState('evaluaciones'); // 'evaluaciones', 'candidatos', 'estadisticas'

  // Memoizar cargarDatos para evitar recreación en cada render
  const cargarEvaluaciones = useCallback(async () => {
    try {
      const response = await evaluacionService.obtenerEvaluaciones({
        ...filtros,
        page: paginacion.current_page,
        per_page: paginacion.per_page
      });
      
      if (response && response.data) {
        setEvaluaciones(response.data.data || []);
        setPaginacion(prev => ({
          ...prev,
          total: response.data.total,
          last_page: response.data.last_page
        }));
      }
    } catch (err) {
      setError(err.message || 'Error al cargar evaluaciones');
    }
  }, [filtros, paginacion.current_page, paginacion.per_page]);

  const cargarCandidatosParaEvaluar = useCallback(async () => {
    try {
      const response = await evaluacionService.candidatosParaEvaluacion();
      if (response && response.data) {
        setCandidatosParaEvaluar(response.data);
      }
    } catch (err) {
      console.error('Error al cargar candidatos para evaluar:', err);
    }
  }, []);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await evaluacionService.obtenerEstadisticas();
      if (response) {
        setEstadisticas(response);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarEvaluaciones(),
        cargarCandidatosParaEvaluar(),
        cargarEstadisticas()
      ]);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [cargarEvaluaciones, cargarCandidatosParaEvaluar, cargarEstadisticas]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPaginacion(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePaginaChange = (nuevaPagina) => {
    setPaginacion(prev => ({
      ...prev,
      current_page: nuevaPagina
    }));
  };

  const crearNuevaEvaluacion = () => {
    navigate('/crear-evaluacion');
  };

  const verDetalleEvaluacion = (evaluacionId) => {
    navigate(`/evaluacion/${evaluacionId}`);
  };

  const evaluarCandidato = (candidatoId) => {
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

  const getTipoEvaluacionLabel = (tipo) => {
    const tipos = evaluacionService.getTiposEvaluacion();
    const tipoEncontrado = tipos.find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  };

  if (loading && evaluaciones.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando Centro de Evaluación...</p>
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
          <button className="btn btn-outline-danger" onClick={cargarDatos}>
            Reintentar
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
            title="Centro de Evaluación" 
            subtitle="Gestión integral de evaluaciones de candidatos"
          />
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      {estadisticas && (
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="small text-white-50">Total Evaluaciones</div>
                    <div className="h4">{estadisticas.resumen_general.total_evaluaciones}</div>
                  </div>
                  <div>
                    <i className="fas fa-clipboard-list fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="small text-white-50">Completadas</div>
                    <div className="h4">{estadisticas.resumen_general.evaluaciones_completadas}</div>
                  </div>
                  <div>
                    <i className="fas fa-check-circle fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="small text-white-50">En Progreso</div>
                    <div className="h4">{estadisticas.resumen_general.evaluaciones_en_progreso}</div>
                  </div>
                  <div>
                    <i className="fas fa-clock fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card bg-warning text-dark">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="small">Pendientes</div>
                    <div className="h4">{estadisticas.resumen_general.evaluaciones_pendientes}</div>
                  </div>
                  <div>
                    <i className="fas fa-hourglass-half fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navegación de pestañas */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${vistaActual === 'evaluaciones' ? 'active' : ''}`}
                onClick={() => setVistaActual('evaluaciones')}
                type="button"
              >
                <i className="fas fa-list me-2"></i>
                Evaluaciones
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${vistaActual === 'candidatos' ? 'active' : ''}`}
                onClick={() => setVistaActual('candidatos')}
                type="button"
              >
                <i className="fas fa-users me-2"></i>
                Candidatos para Evaluar
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${vistaActual === 'estadisticas' ? 'active' : ''}`}
                onClick={() => setVistaActual('estadisticas')}
                type="button"
              >
                <i className="fas fa-chart-bar me-2"></i>
                Reportes
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Contenido de pestañas */}
      <div className="tab-content">
        {/* Pestaña Evaluaciones */}
        {vistaActual === 'evaluaciones' && (
          <div className="tab-pane active">
            <div className="row mb-3">
              <div className="col-lg-8">
                <div className="row g-2">
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={filtros.tipo_evaluacion}
                      onChange={(e) => handleFiltroChange('tipo_evaluacion', e.target.value)}
                    >
                      <option value="">Todos los tipos</option>
                      {evaluacionService.getTiposEvaluacion().map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={filtros.estado_evaluacion}
                      onChange={(e) => handleFiltroChange('estado_evaluacion', e.target.value)}
                    >
                      <option value="">Todos los estados</option>
                      {evaluacionService.getEstadosEvaluacion().map(estado => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={filtros.sort_by}
                      onChange={(e) => handleFiltroChange('sort_by', e.target.value)}
                    >
                      <option value="created_at">Fecha de creación</option>
                      <option value="updated_at">Última actualización</option>
                      <option value="puntuacion_total">Puntuación</option>
                      <option value="nombre_evaluacion">Nombre</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={filtros.sort_order}
                      onChange={(e) => handleFiltroChange('sort_order', e.target.value)}
                    >
                      <option value="desc">Descendente</option>
                      <option value="asc">Ascendente</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 text-end">
                <button 
                  className="btn btn-primary"
                  onClick={crearNuevaEvaluacion}
                >
                  <i className="fas fa-plus me-2"></i>
                  Nueva Evaluación
                </button>
              </div>
            </div>

            {/* Lista de evaluaciones */}
            <div className="card">
              <div className="card-body">
                {evaluaciones.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No hay evaluaciones</h5>
                    <p className="text-muted">Comience creando su primera evaluación</p>
                    <button 
                      className="btn btn-primary"
                      onClick={crearNuevaEvaluacion}
                    >
                      Crear Evaluación
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Candidato</th>
                          <th>Evaluación</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Progreso</th>
                          <th>Puntuación</th>
                          <th>Fecha</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluaciones.map(evaluacion => (
                          <tr key={evaluacion.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm me-2">
                                  <div className="avatar-title bg-primary rounded-circle">
                                    {evaluacion.candidato.nombre.charAt(0)}
                                    {evaluacion.candidato.apellido.charAt(0)}
                                  </div>
                                </div>
                                <div>
                                  <div className="fw-bold">
                                    {evaluacion.candidato.nombre} {evaluacion.candidato.apellido}
                                  </div>
                                  <small className="text-muted">{evaluacion.candidato.email}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="fw-bold">{evaluacion.nombre_evaluacion}</div>
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {getTipoEvaluacionLabel(evaluacion.tipo_evaluacion)}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${getEstadoBadgeClass(evaluacion.estado_evaluacion)}`}>
                                {evaluacion.estado_evaluacion_label}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="progress me-2" style={{width: '80px', height: '8px'}}>
                                  <div 
                                    className="progress-bar" 
                                    style={{width: `${evaluacion.progreso.porcentaje}%`}}
                                  ></div>
                                </div>
                                <small>{evaluacion.progreso.porcentaje}%</small>
                              </div>
                            </td>
                            <td>
                              {evaluacion.puntuacion_total !== null ? (
                                <span className="fw-bold text-primary">
                                  {evaluacion.puntuacion_total.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <small>{evaluacion.fecha_creacion}</small>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => verDetalleEvaluacion(evaluacion.id)}
                                  title="Ver detalles"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                {evaluacion.estado_evaluacion !== 'completada' && (
                                  <button 
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => navigate(`/evaluacion/${evaluacion.id}/editar`)}
                                    title="Editar"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Paginación */}
                {paginacion.last_page > 1 && (
                  <nav className="mt-3">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${paginacion.current_page === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handlePaginaChange(paginacion.current_page - 1)}
                          disabled={paginacion.current_page === 1}
                        >
                          Anterior
                        </button>
                      </li>
                      
                      {Array.from({length: paginacion.last_page}, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === paginacion.last_page || 
                          Math.abs(page - paginacion.current_page) <= 2
                        )
                        .map(page => (
                          <li key={page} className={`page-item ${paginacion.current_page === page ? 'active' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => handlePaginaChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))
                      }
                      
                      <li className={`page-item ${paginacion.current_page === paginacion.last_page ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handlePaginaChange(paginacion.current_page + 1)}
                          disabled={paginacion.current_page === paginacion.last_page}
                        >
                          Siguiente
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pestaña Candidatos para Evaluar */}
        {vistaActual === 'candidatos' && (
          <div className="tab-pane active">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Candidatos Listos para Evaluación</h5>
              </div>
              <div className="card-body">
                {candidatosParaEvaluar.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-user-check fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No hay candidatos para evaluar</h5>
                    <p className="text-muted">Los candidatos aparecerán aquí cuando sean aceptados</p>
                  </div>
                ) : (
                  <div className="row">
                    {candidatosParaEvaluar.map(candidato => (
                      <div key={candidato.id} className="col-xl-4 col-lg-6 mb-4">
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              <div className="avatar-lg me-3">
                                <div className="avatar-title bg-primary rounded-circle">
                                  {candidato.candidato.nombre.charAt(0)}
                                  {candidato.candidato.apellido.charAt(0)}
                                </div>
                              </div>
                              <div>
                                <h6 className="mb-1">
                                  {candidato.candidato.nombre} {candidato.candidato.apellido}
                                </h6>
                                <p className="text-muted mb-0">{candidato.candidato.email}</p>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <small className="text-muted">Puntuación CV:</small>
                              <div className="progress mt-1">
                                <div 
                                  className="progress-bar bg-primary" 
                                  style={{width: `${candidato.puntuacion_cv || 0}%`}}
                                ></div>
                              </div>
                              <small>{candidato.puntuacion_cv || 0}%</small>
                            </div>
                            
                            <div className="mb-3">
                              <span className={`badge ${getEstadoBadgeClass(candidato.estado)}`}>
                                {candidato.estado}
                              </span>
                            </div>
                          </div>
                          <div className="card-footer">
                            <button 
                              className="btn btn-primary w-100"
                              onClick={() => evaluarCandidato(candidato.id)}
                            >
                              <i className="fas fa-clipboard-check me-2"></i>
                              Crear Evaluación
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pestaña Estadísticas */}
        {vistaActual === 'estadisticas' && estadisticas && (
          <div className="tab-pane active">
            <div className="row">
              {/* Gráfico por tipos */}
              <div className="col-lg-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">Evaluaciones por Tipo</h5>
                  </div>
                  <div className="card-body">
                    {Object.keys(estadisticas.por_tipo_evaluacion).length === 0 ? (
                      <div className="text-center py-4">
                        <i className="fas fa-chart-pie fa-2x text-muted mb-3"></i>
                        <p className="text-muted">No hay datos para mostrar</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Tipo</th>
                              <th>Total</th>
                              <th>Completadas</th>
                              <th>Promedio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(estadisticas.por_tipo_evaluacion).map(([tipo, datos]) => (
                              <tr key={tipo}>
                                <td>{getTipoEvaluacionLabel(tipo)}</td>
                                <td>{datos.total}</td>
                                <td>{datos.completadas}</td>
                                <td>
                                  {datos.promedio_puntuacion ? 
                                    datos.promedio_puntuacion.toFixed(1) : 
                                    '-'
                                  }
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

              {/* Estadísticas de puntuaciones */}
              <div className="col-lg-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">Estadísticas de Puntuaciones</h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="border-end">
                          <h4 className="text-primary">
                            {estadisticas.puntuaciones.promedio_general ? 
                              estadisticas.puntuaciones.promedio_general.toFixed(1) : 
                              '-'
                            }
                          </h4>
                          <small className="text-muted">Promedio</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border-end">
                          <h4 className="text-success">
                            {estadisticas.puntuaciones.puntuacion_maxima || '-'}
                          </h4>
                          <small className="text-muted">Máxima</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <h4 className="text-warning">
                          {estadisticas.puntuaciones.puntuacion_minima || '-'}
                        </h4>
                        <small className="text-muted">Mínima</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tendencias mensuales */}
            {Object.keys(estadisticas.tendencias_mensuales).length > 0 && (
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title">Tendencias Mensuales</h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Mes</th>
                              <th>Total Evaluaciones</th>
                              <th>Completadas</th>
                              <th>Promedio Puntuación</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(estadisticas.tendencias_mensuales)
                              .sort(([a], [b]) => b.localeCompare(a))
                              .map(([mes, datos]) => (
                                <tr key={mes}>
                                  <td>{mes}</td>
                                  <td>{datos.total}</td>
                                  <td>{datos.completadas}</td>
                                  <td>
                                    {datos.promedio_puntuacion ? 
                                      datos.promedio_puntuacion.toFixed(1) : 
                                      '-'
                                    }
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CentroEvaluacion;
