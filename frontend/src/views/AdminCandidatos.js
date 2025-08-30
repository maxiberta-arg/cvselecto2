import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminCandidatos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [estadisticas, setEstadisticas] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidatoAEliminar, setCandidatoAEliminar] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar candidatos
      const candidatosResponse = await api.get('/candidatos');
      setCandidatos(candidatosResponse.data);

      // Cargar estadísticas
      const statsResponse = await api.get('/candidatos-estadisticas');
      setEstadisticas(statsResponse.data);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar la información de candidatos');
    } finally {
      setLoading(false);
    }
  };

  const buscarCandidatos = async () => {
    if (!filtro.trim()) {
      cargarDatos();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/candidatos?search=${encodeURIComponent(filtro)}`);
      setCandidatos(response.data);
    } catch (err) {
      setError('Error al buscar candidatos');
    } finally {
      setLoading(false);
    }
  };

  const eliminarCandidato = async (candidato) => {
    try {
      await api.delete(`/candidatos/${candidato.id}`);
      setSuccess(`Candidato ${candidato.name || 'Sin nombre'} eliminado exitosamente`);
      setCandidatos(prev => prev.filter(c => c.id !== candidato.id));
      setShowDeleteModal(false);
      setCandidatoAEliminar(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al eliminar candidato: ' + (err.response?.data?.message || err.message));
    }
  };

  const confirmarEliminacion = (candidato) => {
    setCandidatoAEliminar(candidato);
    setShowDeleteModal(true);
  };

  const candidatosFiltrados = candidatos.filter(candidato => {
    if (!filtro) return true;
    const termino = filtro.toLowerCase();
    return (
      candidato.name?.toLowerCase().includes(termino) ||
      candidato.email?.toLowerCase().includes(termino) ||
      candidato.telefono?.includes(termino) ||
      candidato.apellido?.toLowerCase().includes(termino)
    );
  });

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold text-primary mb-2">
                  <i className="bi bi-people me-2"></i>
                  Gestión de Candidatos
                </h2>
                <p className="text-muted">Administrar todos los candidatos del sistema</p>
              </div>
              <div className="text-end">
                <div className="badge bg-primary fs-6 p-2">
                  Total: {candidatos.length} candidatos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas.total && (
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-people fs-1 mb-2"></i>
                  <h4 className="fw-bold">{estadisticas.total}</h4>
                  <p className="mb-0">Total Candidatos</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-file-earmark-pdf fs-1 mb-2"></i>
                  <h4 className="fw-bold">{estadisticas.con_cv}</h4>
                  <p className="mb-0">Con CV</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-briefcase fs-1 mb-2"></i>
                  <h4 className="fw-bold">{estadisticas.con_experiencia}</h4>
                  <p className="mb-0">Con Experiencia</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-dark h-100">
                <div className="card-body text-center">
                  <i className="bi bi-calendar-plus fs-1 mb-2"></i>
                  <h4 className="fw-bold">{estadisticas.registros_recientes}</h4>
                  <p className="mb-0">Últimos 30 días</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row g-3 align-items-center">
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por nombre, email o teléfono..."
                      value={filtro}
                      onChange={(e) => setFiltro(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && buscarCandidatos()}
                    />
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-primary"
                        onClick={buscarCandidatos}
                      >
                        <i className="bi bi-search me-2"></i>
                        Buscar
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setFiltro('');
                          cargarDatos();
                        }}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de candidatos */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Candidatos Registrados ({candidatosFiltrados.length})
                </h5>
              </div>
              <div className="card-body p-0">
                {candidatosFiltrados.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                    <h5 className="text-muted mt-3">No hay candidatos</h5>
                    <p className="text-muted">No se encontraron candidatos con los criterios especificados</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Candidato</th>
                          <th>Email</th>
                          <th>Teléfono</th>
                          <th>Nivel Educación</th>
                          <th>Experiencia</th>
                          <th>Registro</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidatosFiltrados.map((candidato) => (
                          <tr key={candidato.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-light me-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                  <i className="bi bi-person text-secondary"></i>
                                </div>
                                <div>
                                  <div className="fw-semibold">{candidato.name || 'Sin nombre'}</div>
                                  <small className="text-muted">{candidato.apellido || ''}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="text-break">{candidato.email || 'Sin email'}</span>
                            </td>
                            <td>
                              {candidato.telefono ? (
                                <a href={`tel:${candidato.telefono}`} className="text-decoration-none">
                                  <i className="bi bi-telephone me-1"></i>
                                  {candidato.telefono}
                                </a>
                              ) : (
                                <span className="text-muted">Sin teléfono</span>
                              )}
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {candidato.nivel_educacion || 'No especificado'}
                              </span>
                            </td>
                            <td>
                              {candidato.experiencia_anos ? 
                                `${candidato.experiencia_anos} años` : 
                                <span className="text-muted">Sin especificar</span>
                              }
                            </td>
                            <td>
                              <small className="text-muted">
                                {candidato.created_at ? 
                                  new Date(candidato.created_at).toLocaleDateString('es-AR') : 
                                  'Sin fecha'
                                }
                              </small>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/candidatos/${candidato.id}`)}
                                  title="Ver perfil"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => confirmarEliminacion(candidato)}
                                  title="Eliminar"
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
            </div>
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && candidatoAEliminar && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                    Confirmar Eliminación
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>¿Está seguro que desea eliminar al candidato?</p>
                  <div className="alert alert-info">
                    <strong>Candidato:</strong> {candidatoAEliminar.name || 'Sin nombre'}<br/>
                    <strong>Email:</strong> {candidatoAEliminar.email || 'Sin email'}
                  </div>
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Esta acción no se puede deshacer. Se eliminará toda la información del candidato y sus postulaciones.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={() => eliminarCandidato(candidatoAEliminar)}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
