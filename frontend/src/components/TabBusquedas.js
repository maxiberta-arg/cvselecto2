import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function TabBusquedas({ busquedas, onBusquedasUpdate, empresaData }) {
  const navigate = useNavigate();
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [actionLoading, setActionLoading] = useState(null);

  const filtrarBusquedas = () => {
    if (filtroEstado === 'todas') return busquedas;
    return busquedas.filter(busqueda => busqueda.estado === filtroEstado);
  };

  const handleCambiarEstado = async (busquedaId, nuevoEstado) => {
    try {
      setActionLoading(busquedaId);
      
      await api.put(`/busquedas-laborales/${busquedaId}`, {
        estado: nuevoEstado
      });
      
      toast.success(`Búsqueda ${nuevoEstado === 'activa' ? 'activada' : nuevoEstado === 'pausada' ? 'pausada' : 'finalizada'} exitosamente`);
      onBusquedasUpdate();
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar el estado de la búsqueda');
    } finally {
      setActionLoading(null);
    }
  };

  const estadisticasBusquedas = {
    total: busquedas.length,
    activas: busquedas.filter(b => b.estado === 'activa').length,
    pausadas: busquedas.filter(b => b.estado === 'pausada').length,
    finalizadas: busquedas.filter(b => b.estado === 'finalizada').length
  };

  return (
    <div className="tab-busquedas">
      {/* Header con estadísticas */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h4>🎯 Gestión de Búsquedas Laborales</h4>
          <p className="text-muted">Administra tus ofertas laborales y reclutamientos</p>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/crear-busqueda')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Búsqueda
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h5 className="text-primary">{estadisticasBusquedas.total}</h5>
              <small className="text-muted">Total Búsquedas</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h5 className="text-success">{estadisticasBusquedas.activas}</h5>
              <small className="text-muted">Activas</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h5 className="text-warning">{estadisticasBusquedas.pausadas}</h5>
              <small className="text-muted">Pausadas</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <h5 className="text-secondary">{estadisticasBusquedas.finalizadas}</h5>
              <small className="text-muted">Finalizadas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="row mb-3">
        <div className="col-md-6">
          <select
            className="form-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todas">Todas las búsquedas</option>
            <option value="activa">Activas</option>
            <option value="pausada">Pausadas</option>
            <option value="finalizada">Finalizadas</option>
          </select>
        </div>
        <div className="col-md-6 text-end">
          <span className="badge bg-primary fs-6">
            {filtrarBusquedas().length} búsquedas
          </span>
        </div>
      </div>

      {/* Lista de búsquedas */}
      <div className="row">
        {filtrarBusquedas().length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-search display-4 text-muted mb-3"></i>
                <h5 className="text-muted">No hay búsquedas {filtroEstado !== 'todas' ? filtroEstado + 's' : ''}</h5>
                <p className="text-muted">
                  {filtroEstado === 'todas' 
                    ? 'Crea tu primera búsqueda laboral para comenzar a reclutar candidatos.'
                    : `No tienes búsquedas ${filtroEstado}s en este momento.`
                  }
                </p>
                {filtroEstado === 'todas' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/crear-busqueda')}
                  >
                    Crear Primera Búsqueda
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          filtrarBusquedas().map(busqueda => (
            <div key={busqueda.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className={`badge ${
                    busqueda.estado === 'activa' ? 'bg-success' :
                    busqueda.estado === 'pausada' ? 'bg-warning' : 'bg-secondary'
                  }`}>
                    {busqueda.estado}
                  </span>
                  <small className="text-muted">
                    {new Date(busqueda.created_at).toLocaleDateString()}
                  </small>
                </div>
                
                <div className="card-body">
                  <h6 className="card-title">{busqueda.titulo}</h6>
                  <p className="card-text text-muted small">
                    {busqueda.descripcion?.substring(0, 100)}...
                  </p>
                  
                  <div className="mb-3">
                    <div className="row text-center">
                      <div className="col-4">
                        <small className="text-muted d-block">Modalidad</small>
                        <strong className="small">{busqueda.modalidad}</strong>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Ubicación</small>
                        <strong className="small">{busqueda.ubicacion}</strong>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Salario</small>
                        <strong className="small">
                          ${parseInt(busqueda.salario_min).toLocaleString()} - ${parseInt(busqueda.salario_max).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer bg-transparent">
                  <div className="row g-1">
                    <div className="col-6">
                      <button 
                        className="btn btn-outline-primary btn-sm w-100"
                        onClick={() => navigate(`/busqueda/${busqueda.id}`)}
                      >
                        <i className="bi bi-eye me-1"></i>
                        Ver Detalle
                      </button>
                    </div>
                    <div className="col-6">
                      <button 
                        className="btn btn-outline-secondary btn-sm w-100"
                        onClick={() => navigate(`/editar-busqueda/${busqueda.id}`)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                      </button>
                    </div>
                  </div>
                  
                  {/* Acciones de estado */}
                  <div className="row g-1 mt-2">
                    {busqueda.estado === 'activa' && (
                      <>
                        <div className="col-6">
                          <button 
                            className="btn btn-outline-warning btn-sm w-100"
                            onClick={() => handleCambiarEstado(busqueda.id, 'pausada')}
                            disabled={actionLoading === busqueda.id}
                          >
                            {actionLoading === busqueda.id ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="bi bi-pause me-1"></i>
                            )}
                            Pausar
                          </button>
                        </div>
                        <div className="col-6">
                          <button 
                            className="btn btn-outline-danger btn-sm w-100"
                            onClick={() => handleCambiarEstado(busqueda.id, 'finalizada')}
                            disabled={actionLoading === busqueda.id}
                          >
                            <i className="bi bi-stop me-1"></i>
                            Finalizar
                          </button>
                        </div>
                      </>
                    )}
                    
                    {busqueda.estado === 'pausada' && (
                      <div className="col-12">
                        <button 
                          className="btn btn-outline-success btn-sm w-100"
                          onClick={() => handleCambiarEstado(busqueda.id, 'activa')}
                          disabled={actionLoading === busqueda.id}
                        >
                          {actionLoading === busqueda.id ? (
                            <span className="spinner-border spinner-border-sm me-1"></span>
                          ) : (
                            <i className="bi bi-play me-1"></i>
                          )}
                          Reactivar
                        </button>
                      </div>
                    )}
                    
                    {busqueda.estado === 'finalizada' && (
                      <div className="col-12">
                        <button 
                          className="btn btn-outline-info btn-sm w-100"
                          onClick={() => navigate(`/busqueda/${busqueda.id}/candidatos`)}
                        >
                          <i className="bi bi-people me-1"></i>
                          Ver Candidatos
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
