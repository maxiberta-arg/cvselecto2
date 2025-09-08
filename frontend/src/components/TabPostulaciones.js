import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TabPostulaciones({ empresaData, onMoverAPool, postulaciones, onPostulacionesUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Usar postulaciones directamente de props
  const postulacionesData = postulaciones || [];

  const cambiarEstadoPostulacion = async (postulacionId, nuevoEstado) => {
    try {
      await api.put(`/postulaciones/${postulacionId}`, { estado: nuevoEstado });
      
      setSuccess(`Estado cambiado a "${nuevoEstado}"`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Actualizar datos en el componente padre
      if (onPostulacionesUpdate) {
        onPostulacionesUpdate();
      }
      
    } catch (err) {
      setError('Error al cambiar estado');
      console.error(err);
    }
  };

  const moverAPool = async (candidato, postulacionId) => {
    const result = await onMoverAPool(candidato, postulacionId);
    if (result.success) {
      setSuccess('Candidato agregado al pool privado');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Error al agregar al pool');
    }
  };

  const filtrarPostulaciones = () => {
    if (filtroEstado === 'todos') return postulacionesData;
    return postulacionesData.filter(p => p.estado === filtroEstado);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando postulaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mensajes */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show mb-3">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Filtros */}
      <div className="row mb-3">
        <div className="col-md-6">
          <select 
            className="form-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="postulado">Postulado</option>
            <option value="en_revision">En Revisión</option>
            <option value="seleccionado">Seleccionado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
        <div className="col-md-6 text-end">
          <span className="badge bg-primary fs-6">
            {filtrarPostulaciones().length} postulaciones
          </span>
        </div>
      </div>

      {/* Lista de postulaciones */}
      {filtrarPostulaciones().length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
          <h6 className="text-muted">
            No hay postulaciones {filtroEstado !== 'todos' ? `con estado "${filtroEstado}"` : ''}
          </h6>
          <p className="text-muted">
            Las postulaciones aparecerán aquí cuando los candidatos se postulen a tus búsquedas laborales.
          </p>
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
                    <strong className="text-primary">
                      {postulacion.busqueda_laboral?.titulo}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${
                      postulacion.estado === 'postulado' ? 'bg-warning' :
                      postulacion.estado === 'en_revision' ? 'bg-info' :
                      postulacion.estado === 'seleccionado' ? 'bg-success' :
                      'bg-danger'
                    }`}>
                      {postulacion.estado === 'en_revision' ? 'En Revisión' : postulacion.estado}
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
                    <div className="btn-group btn-group-sm">
                      {/* Cambiar estados */}
                      {postulacion.estado === 'postulado' && (
                        <button 
                          className="btn btn-outline-info"
                          title="Marcar en revisión"
                          onClick={() => cambiarEstadoPostulacion(postulacion.id, 'en_revision')}
                        >
                          <i className="bi bi-hourglass-split"></i>
                        </button>
                      )}
                      
                      {(postulacion.estado === 'postulado' || postulacion.estado === 'en_revision') && (
                        <>
                          <button 
                            className="btn btn-outline-success"
                            title="Seleccionar candidato"
                            onClick={() => cambiarEstadoPostulacion(postulacion.id, 'seleccionado')}
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            title="Rechazar candidato"
                            onClick={() => cambiarEstadoPostulacion(postulacion.id, 'rechazado')}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </>
                      )}
                      
                      {/* Agregar a pool */}
                      <button 
                        className="btn btn-outline-secondary"
                        title="Agregar a mi pool privado"
                        onClick={() => moverAPool(postulacion.candidato, postulacion.id)}
                      >
                        <i className="bi bi-plus-circle"></i>
                      </button>
                      
                      {/* Ver detalles */}
                      <button 
                        className="btn btn-outline-primary"
                        title="Ver detalles del candidato"
                        onClick={() => navigate(`/candidatos/${postulacion.candidato?.id}`)}
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
  );
}
