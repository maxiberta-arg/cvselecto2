import React, { useState, useEffect } from 'react';
import postulacionEvaluacionService from '../services/postulacionEvaluacionService';
import { useNavigate } from 'react-router-dom';

/**
 * Componente EvaluacionesPostulacion
 * 
 * Muestra y gestiona las evaluaciones relacionadas con una postulación específica.
 * Permite ver, crear y gestionar evaluaciones desde el contexto de una postulación.
 */
const EvaluacionesPostulacion = ({ postulacionId, postulacion, onEvaluacionCreada }) => {
  const navigate = useNavigate();
  
  // Estados principales
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Estados del formulario de nueva evaluación
  const [formularioEvaluacion, setFormularioEvaluacion] = useState({
    nombre_evaluacion: '',
    tipo_evaluacion: 'integral',
    criterios_evaluacion: {}
  });
  
  // Estados de UI
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (postulacionId) {
      cargarEvaluaciones();
    }
  }, [postulacionId]);

  useEffect(() => {
    // Actualizar criterios cuando cambia el tipo de evaluación
    if (formularioEvaluacion.tipo_evaluacion) {
      const criterios = postulacionEvaluacionService.obtenerCriteriosPorDefecto(formularioEvaluacion.tipo_evaluacion);
      setFormularioEvaluacion(prev => ({
        ...prev,
        criterios_evaluacion: criterios
      }));
    }
  }, [formularioEvaluacion.tipo_evaluacion]);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      const response = await postulacionEvaluacionService.obtenerEvaluacionesDePostulacion(postulacionId);
      setEvaluaciones(response.evaluaciones || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar evaluaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearEvaluacion = async (e) => {
    e.preventDefault();
    
    try {
      setEnviandoFormulario(true);
      
      const datosEvaluacion = {
        ...formularioEvaluacion,
        nombre_evaluacion: formularioEvaluacion.nombre_evaluacion || 
          `Evaluación ${formularioEvaluacion.tipo_evaluacion} - ${postulacion?.busqueda_laboral?.titulo || 'Candidato'}`
      };

      const response = await postulacionEvaluacionService.crearEvaluacionDesdePostulacion(
        postulacionId,
        datosEvaluacion
      );

      // Actualizar lista de evaluaciones
      await cargarEvaluaciones();
      
      // Limpiar formulario y cerrar modal
      setFormularioEvaluacion({
        nombre_evaluacion: '',
        tipo_evaluacion: 'integral',
        criterios_evaluacion: {}
      });
      setMostrarFormulario(false);
      
      // Mostrar mensaje de éxito
      setSuccess('Evaluación creada exitosamente');
      setTimeout(() => setSuccess(''), 4000);
      
      // Notificar al componente padre si hay callback
      if (onEvaluacionCreada) {
        onEvaluacionCreada(response.evaluacion);
      }
      
    } catch (err) {
      setError('Error al crear evaluación');
      console.error(err);
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const irADetalleEvaluacion = (evaluacionId) => {
    navigate(`/evaluaciones/${evaluacionId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Cargando evaluaciones...</span>
        </div>
        <p className="mt-2 mb-0 small text-muted">Cargando evaluaciones...</p>
      </div>
    );
  }

  return (
    <div className="evaluaciones-postulacion">
      {/* Mensajes de estado */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Header con estadísticas */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-1">
            <i className="bi bi-clipboard-check me-2"></i>
            Evaluaciones de Candidato
          </h6>
          <small className="text-muted">
            {evaluaciones.length} evaluación{evaluaciones.length !== 1 ? 'es' : ''} 
            {evaluaciones.length > 0 && (
              <span className="ms-2">
                • Pendientes: {evaluaciones.filter(e => e.estado_evaluacion === 'pendiente').length}
                • Completadas: {evaluaciones.filter(e => e.estado_evaluacion === 'completada').length}
              </span>
            )}
          </small>
        </div>
        
        {/* Botón crear evaluación */}
        {postulacion && postulacionEvaluacionService.puedeGenerarEvaluacion(postulacion.estado) && (
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={() => setMostrarFormulario(true)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Nueva Evaluación
          </button>
        )}
      </div>

      {/* Lista de evaluaciones */}
      {evaluaciones.length === 0 ? (
        <div className="text-center py-4">
          <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '2rem' }}></i>
          <p className="text-muted mt-2 mb-0">No hay evaluaciones registradas</p>
          {postulacion && postulacionEvaluacionService.puedeGenerarEvaluacion(postulacion.estado) && (
            <small className="text-muted">
              El candidato está en estado "{postulacion.estado}" y puede ser evaluado
            </small>
          )}
        </div>
      ) : (
        <div className="row">
          {evaluaciones.map((evaluacion) => {
            const estadoFormat = postulacionEvaluacionService.formatearEstadoEvaluacion(evaluacion.estado_evaluacion);
            return (
              <div key={evaluacion.id} className="col-12 mb-2">
                <div className="card border-start border-3 border-primary">
                  <div className="card-body py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1">
                          {evaluacion.nombre_evaluacion}
                        </h6>
                        <div className="d-flex gap-3 small text-muted">
                          <span>
                            <i className="bi bi-tag me-1"></i>
                            {evaluacion.tipo_evaluacion}
                          </span>
                          <span>
                            <i className="bi bi-calendar3 me-1"></i>
                            {new Date(evaluacion.created_at).toLocaleDateString()}
                          </span>
                          {evaluacion.puntuacion_total && (
                            <span>
                              <i className="bi bi-star-fill me-1"></i>
                              {evaluacion.puntuacion_total}/100
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-end">
                        <span className={`badge bg-${estadoFormat.clase} mb-2`}>
                          {estadoFormat.texto}
                        </span>
                        <br />
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => irADetalleEvaluacion(evaluacion.id)}
                          title="Ver detalles de la evaluación"
                        >
                          <i className="bi bi-eye"></i>
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

      {/* Modal/Formulario para crear nueva evaluación */}
      {mostrarFormulario && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Nueva Evaluación
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setMostrarFormulario(false)}
                ></button>
              </div>
              
              <form onSubmit={handleCrearEvaluacion}>
                <div className="modal-body">
                  {/* Nombre de evaluación */}
                  <div className="mb-3">
                    <label className="form-label">Nombre de la Evaluación</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formularioEvaluacion.nombre_evaluacion}
                      onChange={(e) => setFormularioEvaluacion(prev => ({
                        ...prev,
                        nombre_evaluacion: e.target.value
                      }))}
                      placeholder={`Evaluación para ${postulacion?.busqueda_laboral?.titulo || 'candidato'}`}
                    />
                    <small className="form-text text-muted">
                      Si se deja vacío, se generará automáticamente
                    </small>
                  </div>

                  {/* Tipo de evaluación */}
                  <div className="mb-3">
                    <label className="form-label">Tipo de Evaluación *</label>
                    <select
                      className="form-select"
                      value={formularioEvaluacion.tipo_evaluacion}
                      onChange={(e) => setFormularioEvaluacion(prev => ({
                        ...prev,
                        tipo_evaluacion: e.target.value
                      }))}
                      required
                    >
                      <option value="integral">Evaluación Integral</option>
                      <option value="tecnica">Evaluación Técnica</option>
                      <option value="competencias">Evaluación de Competencias</option>
                      <option value="cultural">Evaluación Cultural</option>
                      <option value="entrevista">Entrevista</option>
                      <option value="personalizada">Personalizada</option>
                    </select>
                  </div>

                  {/* Preview de criterios */}
                  {Object.keys(formularioEvaluacion.criterios_evaluacion).length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Criterios de Evaluación</label>
                      <div className="border rounded p-2 bg-light">
                        {Object.entries(formularioEvaluacion.criterios_evaluacion).map(([criterio, datos]) => (
                          <div key={criterio} className="d-flex justify-content-between small mb-1">
                            <span>{datos.descripcion}</span>
                            <span className="fw-bold">{datos.peso}%</span>
                          </div>
                        ))}
                      </div>
                      <small className="form-text text-muted">
                        Los criterios se pueden modificar después de crear la evaluación
                      </small>
                    </div>
                  )}
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setMostrarFormulario(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={enviandoFormulario}
                  >
                    {enviandoFormulario ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Crear Evaluación
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluacionesPostulacion;
