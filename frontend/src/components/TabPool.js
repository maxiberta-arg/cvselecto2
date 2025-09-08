import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TabPool({ empresaData, candidatos, onPoolUpdate, onRefreshStats }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    estado_interno: '',
    origen: '',
    search: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Usar candidatos directamente de props en lugar de cargar desde API
  const poolCandidatos = candidatos || [];

  // Filtrar candidatos localmente
  const candidatosFiltrados = poolCandidatos.filter(candidato => {
    // Filtro por estado
    if (filtros.estado_interno && candidato.estado_interno !== filtros.estado_interno) {
      return false;
    }
    
    // Filtro por origen
    if (filtros.origen && candidato.origen !== filtros.origen) {
      return false;
    }
    
    // Filtro por búsqueda
    if (filtros.search) {
      const searchTerm = filtros.search.toLowerCase();
      const nombreCompleto = `${candidato.candidato?.nombre} ${candidato.candidato?.apellido}`.toLowerCase();
      const email = candidato.candidato?.email?.toLowerCase() || '';
      
      if (!nombreCompleto.includes(searchTerm) && !email.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });

  const eliminarDelPool = async (candidatoId) => {
    if (!confirm('¿Estás seguro de eliminar este candidato del pool?')) return;
    
    try {
      await api.delete(`/pool-candidatos/candidato/${candidatoId}`);
      
      setSuccess('Candidato eliminado del pool');
      setTimeout(() => setSuccess(''), 3000);
      
      // Actualizar datos en el componente padre
      if (onPoolUpdate) {
        onPoolUpdate();
      }
      if (onRefreshStats) {
        onRefreshStats();
      }
      
    } catch (err) {
      setError('Error al eliminar candidato');
      console.error(err);
    }
  };

  const actualizarEstadoInterno = async (candidatoId, nuevoEstado) => {
    try {
      await api.put(`/pool-candidatos/candidato/${candidatoId}`, {
        estado_interno: nuevoEstado
      });
      
      setPoolCandidatos(prev => prev.map(p => 
        p.candidato.id === candidatoId ? { ...p, estado_interno: nuevoEstado } : p
      ));
      
      setSuccess(`Estado actualizado a "${nuevoEstado}"`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError('Error al actualizar estado');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando pool...</span>
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
        <div className="col-md-3">
          <select 
            className="form-select"
            value={filtros.estado_interno}
            onChange={(e) => setFiltros(prev => ({...prev, estado_interno: e.target.value}))}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="en_proceso">En Proceso</option>
            <option value="contratado">Contratado</option>
            <option value="descartado">Descartado</option>
            <option value="pausado">Pausado</option>
          </select>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select"
            value={filtros.origen}
            onChange={(e) => setFiltros(prev => ({...prev, origen: e.target.value}))}
          >
            <option value="">Todos los orígenes</option>
            <option value="postulacion">Postulación</option>
            <option value="manual">Manual</option>
            <option value="referido">Referido</option>
            <option value="importacion">Importación</option>
          </select>
        </div>
        <div className="col-md-4">
          <input 
            type="text"
            className="form-control"
            placeholder="Buscar candidatos..."
            value={filtros.search}
            onChange={(e) => setFiltros(prev => ({...prev, search: e.target.value}))}
          />
        </div>
        <div className="col-md-2 text-end">
          <span className="badge bg-success fs-6">
            {candidatosFiltrados.length} en pool
          </span>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="btn-group">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/agregar-candidato-manual')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Candidato Manual
            </button>
            <button 
              className="btn btn-outline-primary"
              onClick={() => {
                // Implementar importación desde postulaciones
                console.log('Importar desde postulaciones');
              }}
            >
              <i className="bi bi-download me-2"></i>
              Importar desde Postulaciones
            </button>
          </div>
        </div>
      </div>

      {/* Lista de candidatos en pool */}
      {candidatosFiltrados.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-collection fs-1 text-muted mb-3"></i>
          <h6 className="text-muted">
            {poolCandidatos.length === 0 ? 'Tu pool privado está vacío' : 'No hay candidatos que coincidan con los filtros'}
          </h6>
          <p className="text-muted">
            {poolCandidatos.length === 0 
              ? 'Agrega candidatos manualmente o importa desde tus postulaciones para comenzar a construir tu pool de talento.'
              : 'Intenta cambiar los filtros para ver más candidatos.'
            }
          </p>
          {poolCandidatos.length === 0 && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/agregar-candidato-manual')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Primer Candidato
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Estado Interno</th>
                <th>Origen</th>
                <th>Puntuación</th>
                <th>Tags</th>
                <th>Último Contacto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {candidatosFiltrados.map(pool => (
                <tr key={pool.id}>
                  <td>
                    <div>
                      <strong>
                        {pool.candidato ? 
                          `${pool.candidato.nombre || ''} ${pool.candidato.apellido || ''}`.trim() || 'Sin nombre'
                          : 'Sin nombre'
                        }
                      </strong>
                      <div className="small text-muted">
                        {pool.candidato?.email || 'Sin email'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <select 
                      className="form-select form-select-sm"
                      value={pool.estado_interno}
                      onChange={(e) => actualizarEstadoInterno(pool.candidato.id, e.target.value)}
                    >
                      <option value="activo">Activo</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="contratado">Contratado</option>
                      <option value="descartado">Descartado</option>
                      <option value="pausado">Pausado</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${
                      pool.origen === 'postulacion' ? 'bg-primary' :
                      pool.origen === 'manual' ? 'bg-success' :
                      pool.origen === 'referido' ? 'bg-info' :
                      'bg-secondary'
                    }`}>
                      {pool.origen}
                    </span>
                  </td>
                  <td>
                    {pool.puntuacion_empresa ? (
                      <span className="badge bg-warning text-dark">
                        {pool.puntuacion_empresa}/10
                      </span>
                    ) : (
                      <span className="text-muted">Sin calificar</span>
                    )}
                  </td>
                  <td>
                    <div>
                      {pool.tags && pool.tags.length > 0 ? (
                        pool.tags.map((tag, index) => (
                          <span key={index} className="badge bg-light text-dark me-1">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">Sin tags</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {pool.ultimo_contacto ? (
                      new Date(pool.ultimo_contacto).toLocaleDateString()
                    ) : (
                      <span className="text-muted">Nunca</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-primary"
                        title="Ver detalles"
                        onClick={() => navigate(`/candidatos/${pool.candidato.id}`)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        title="Editar información del pool"
                        onClick={() => {
                          // Implementar edición rápida
                          console.log('Editar pool info', pool.candidato.id);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        title="Eliminar del pool"
                        onClick={() => eliminarDelPool(pool.candidato.id)}
                      >
                        <i className="bi bi-trash"></i>
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
