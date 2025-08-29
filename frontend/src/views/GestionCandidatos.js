import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function GestionCandidatos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidatos, setCandidatos] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [user?.id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos de la empresa
      const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
      const empresa = empresaResponse.data;

      // Cargar todas las postulaciones de las búsquedas de la empresa
      const postulacionesResponse = await api.get('/postulaciones');
      const todasLasPostulaciones = postulacionesResponse.data;
      
      // Filtrar solo las postulaciones de las búsquedas de esta empresa
      const postulacionesEmpresa = todasLasPostulaciones.filter(
        postulacion => postulacion.busqueda_laboral?.empresa_id === empresa.id
      );

      setPostulaciones(postulacionesEmpresa);

      // Extraer candidatos únicos de las postulaciones
      const candidatosUnicos = new Map();
      postulacionesEmpresa.forEach(postulacion => {
        if (postulacion.candidato) {
          candidatosUnicos.set(postulacion.candidato.id, postulacion.candidato);
        }
      });

      setCandidatos(Array.from(candidatosUnicos.values()));

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar la información de candidatos');
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar estado de postulación
  const cambiarEstadoPostulacion = async (postulacionId, nuevoEstado) => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await api.put(`/postulaciones/${postulacionId}`, {
        estado: nuevoEstado
      });

      if (response.data) {
        // Actualizar localmente
        setPostulaciones(prev => prev.map(p => 
          p.id === postulacionId 
            ? { ...p, estado: nuevoEstado }
            : p
        ));

        setSuccess(`Estado cambiado a "${nuevoEstado}" exitosamente`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error al cambiar el estado de la postulación');
    } finally {
      setActionLoading(false);
    }
  };

  // Función para calificar candidato con puntuación y notas
  const calificarCandidato = async (postulacionId, puntuacion, notas) => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await api.put(`/postulaciones/${postulacionId}`, {
        puntuacion: puntuacion,
        notas_empresa: notas
      });

      if (response.data) {
        // Actualizar localmente
        setPostulaciones(prev => prev.map(p => 
          p.id === postulacionId 
            ? { ...p, puntuacion: puntuacion, notas_empresa: notas }
            : p
        ));

        setSuccess('Candidato calificado exitosamente');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error al calificar:', err);
      setError('Error al calificar el candidato');
    } finally {
      setActionLoading(false);
    }
  };

  // Función para ver detalles del candidato
  const verDetalleCandidato = (candidatoId) => {
    navigate(`/candidatos/${candidatoId}`);
  };

  const filtrarPostulaciones = () => {
    if (filtroEstado === 'todos') return postulaciones;
    return postulaciones.filter(p => p.estado === filtroEstado);
  };

  const contarPorEstado = (estado) => {
    return postulaciones.filter(p => p.estado === estado).length;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando candidatos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Gestión de Candidatos</h1>
          <p className="text-muted">Administra los candidatos y postulaciones de tu empresa</p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/empresa')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Dashboard
        </button>
      </div>

      {/* Mensaje de éxito */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Total Candidatos</h6>
                  <h3 className="mb-0">{candidatos.length}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-people fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Postulados</h6>
                  <h3 className="mb-0">{contarPorEstado('postulado')}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-clock fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">En Proceso</h6>
                  <h3 className="mb-0">{contarPorEstado('en proceso')}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-gear fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Seleccionados</h6>
                  <h3 className="mb-0">{contarPorEstado('seleccionado')}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-check-circle fs-2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h6 className="mb-0">Filtrar por estado:</h6>
            </div>
            <div className="col-md-6">
              <select 
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="postulado">Postulado</option>
                <option value="en proceso">En Proceso</option>
                <option value="seleccionado">Seleccionado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Postulaciones */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-list-check me-2"></i>
            Postulaciones 
            <span className="badge bg-secondary ms-2">{filtrarPostulaciones().length}</span>
          </h5>
        </div>
        <div className="card-body">
          {filtrarPostulaciones().length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
              <h6 className="text-muted">No hay postulaciones {filtroEstado !== 'todos' ? `con estado "${filtroEstado}"` : ''}</h6>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Candidato</th>
                    <th>Búsqueda</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Puntuación</th>
                    <th>Notas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarPostulaciones().map(postulacion => (
                    <tr key={postulacion.id}>
                      <td>
                        <div>
                          <strong>
                            {postulacion.candidato ? 
                              `${postulacion.candidato.nombre || ''} ${postulacion.candidato.apellido || ''}`.trim() || 'Sin nombre'
                              : 'Sin nombre'
                            }
                          </strong>
                          <div className="small text-muted">
                            {postulacion.candidato?.email || 'Sin email'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong 
                            className="text-primary" 
                            style={{cursor: 'pointer'}}
                            onClick={() => navigate(`/busqueda-detalle/${postulacion.busqueda_laboral?.id}`)}
                            title="Ver detalles de la búsqueda"
                          >
                            {postulacion.busqueda_laboral?.titulo}
                          </strong>
                          <div className="small text-muted">
                            {postulacion.busqueda_laboral?.modalidad}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          postulacion.estado === 'postulado' ? 'bg-warning' :
                          postulacion.estado === 'en proceso' ? 'bg-info' :
                          postulacion.estado === 'seleccionado' ? 'bg-success' :
                          'bg-danger'
                        }`}>
                          {postulacion.estado}
                        </span>
                      </td>
                      <td>
                        {new Date(postulacion.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        {postulacion.puntuacion ? (
                          <span className="badge bg-primary">{postulacion.puntuacion}/10</span>
                        ) : (
                          <span className="text-muted">Sin calificar</span>
                        )}
                      </td>
                      <td>
                        {postulacion.notas_empresa ? (
                          <small className="text-muted" title={postulacion.notas_empresa}>
                            {postulacion.notas_empresa.length > 30 
                              ? postulacion.notas_empresa.substring(0, 30) + '...' 
                              : postulacion.notas_empresa}
                          </small>
                        ) : (
                          <span className="text-muted">Sin notas</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {/* Botones de cambio de estado */}
                          {postulacion.estado === 'postulado' && (
                            <button 
                              className="btn btn-outline-info"
                              title="Marcar en proceso"
                              onClick={() => cambiarEstadoPostulacion(postulacion.id, 'en proceso')}
                              disabled={actionLoading}
                            >
                              <i className="bi bi-hourglass-split"></i>
                            </button>
                          )}
                          
                          {(postulacion.estado === 'postulado' || postulacion.estado === 'en proceso') && (
                            <>
                              <button 
                                className="btn btn-outline-success"
                                title="Seleccionar candidato"
                                onClick={() => cambiarEstadoPostulacion(postulacion.id, 'seleccionado')}
                                disabled={actionLoading}
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                title="Rechazar candidato"
                                onClick={() => cambiarEstadoPostulacion(postulacion.id, 'rechazado')}
                                disabled={actionLoading}
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            </>
                          )}
                          
                          {/* Botón de calificación */}
                          <button 
                            className="btn btn-outline-warning"
                            title="Calificar candidato"
                            onClick={() => {
                              const puntuacion = prompt('Puntuación (1-10):', postulacion.puntuacion || '');
                              const notas = prompt('Notas adicionales:', postulacion.notas_empresa || '');
                              if (puntuacion !== null && notas !== null && puntuacion.trim() !== '') {
                                const puntuacionNum = parseInt(puntuacion);
                                if (puntuacionNum >= 1 && puntuacionNum <= 10) {
                                  calificarCandidato(postulacion.id, puntuacionNum, notas);
                                } else {
                                  alert('La puntuación debe ser entre 1 y 10');
                                }
                              }
                            }}
                            disabled={actionLoading}
                          >
                            <i className="bi bi-star"></i>
                          </button>
                          
                          {/* Botón de ver detalles */}
                          <button 
                            className="btn btn-outline-primary"
                            title="Ver detalles del candidato"
                            onClick={() => verDetalleCandidato(postulacion.candidato?.id)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
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
  );
}
