import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function VincularBusquedas({ candidato, show, onHide, onUpdate }) {
  const [busquedas, setBusquedas] = useState([]);
  const [busquedasVinculadas, setBusquedasVinculadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vinculando, setVinculando] = useState(false);
  const [filtros, setFiltros] = useState({
    search: '',
    estado: 'activa'
  });

  useEffect(() => {
    if (show && candidato) {
      cargarBusquedas();
      cargarVinculacionesExistentes();
    }
  }, [show, candidato]);

  const cargarBusquedas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/busquedas-laborales', {
        params: {
          empresa_propia: true, // Solo búsquedas de la empresa
          estado: filtros.estado,
          search: filtros.search,
          per_page: 50
        }
      });
      
      setBusquedas(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar búsquedas:', error);
      toast.error('Error al cargar las búsquedas laborales');
    } finally {
      setLoading(false);
    }
  };

  const cargarVinculacionesExistentes = async () => {
    try {
      const response = await api.get(`/pool-candidatos/candidato/${candidato.id}/vinculaciones`);
      setBusquedasVinculadas(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar vinculaciones:', error);
      // No mostrar error aquí ya que puede ser que no existan vinculaciones
    }
  };

  const vincularBusqueda = async (busquedaId) => {
    try {
      setVinculando(busquedaId);
      
      const response = await api.post('/pool-candidatos/vincular-busqueda', {
        candidato_id: candidato.candidato_id,
        busqueda_laboral_id: busquedaId
      });
      
      if (response.data.success) {
        toast.success('Candidato vinculado a la búsqueda');
        cargarVinculacionesExistentes();
        onUpdate && onUpdate();
      }
    } catch (error) {
      console.error('Error al vincular:', error);
      if (error.response?.status === 409) {
        toast.warning('El candidato ya está vinculado a esta búsqueda');
      } else {
        toast.error('Error al vincular candidato');
      }
    } finally {
      setVinculando(false);
    }
  };

  const desvincularBusqueda = async (vinculacionId) => {
    try {
      setVinculando(vinculacionId);
      
      const response = await api.delete(`/pool-candidatos/vinculaciones/${vinculacionId}`);
      
      if (response.data.success) {
        toast.success('Vinculación eliminada');
        cargarVinculacionesExistentes();
        onUpdate && onUpdate();
      }
    } catch (error) {
      console.error('Error al desvincular:', error);
      toast.error('Error al eliminar vinculación');
    } finally {
      setVinculando(false);
    }
  };

  const busquedaEstaVinculada = (busquedaId) => {
    return busquedasVinculadas.some(v => v.busqueda_laboral_id === busquedaId);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'activa': { color: 'success', text: 'Activa' },
      'pausada': { color: 'warning', text: 'Pausada' },
      'cerrada': { color: 'danger', text: 'Cerrada' },
      'completada': { color: 'primary', text: 'Completada' }
    };
    return badges[estado] || { color: 'secondary', text: estado };
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-link-45deg me-2"></i>
              Vincular con Búsquedas Laborales
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Info del candidato */}
            <div className="alert alert-info">
              <h6>
                <i className="bi bi-person-circle me-1"></i>
                Candidato: {candidato.candidato?.user?.name || 
                          `${candidato.candidato?.nombre || ''} ${candidato.candidato?.apellido || ''}`.trim()}
              </h6>
              <small className="text-muted">{candidato.candidato?.email}</small>
            </div>

            <div className="row">
              {/* Búsquedas Disponibles */}
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="bi bi-search me-2"></i>
                      Búsquedas Disponibles
                    </h6>
                  </div>
                  <div className="card-body">
                    {/* Filtros */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Buscar por título o descripción..."
                          value={filtros.search}
                          onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-4">
                        <select 
                          className="form-select form-select-sm"
                          value={filtros.estado}
                          onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                        >
                          <option value="activa">Activas</option>
                          <option value="pausada">Pausadas</option>
                          <option value="todas">Todas</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <button 
                          className="btn btn-outline-secondary btn-sm w-100"
                          onClick={cargarBusquedas}
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                        </button>
                      </div>
                    </div>

                    {/* Lista de búsquedas */}
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      </div>
                    ) : busquedas.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-search fs-1"></i>
                        <p className="mt-2">No hay búsquedas disponibles</p>
                      </div>
                    ) : (
                      <div className="list-group">
                        {busquedas.map(busqueda => {
                          const yaVinculada = busquedaEstaVinculada(busqueda.id);
                          const estadoBadge = getEstadoBadge(busqueda.estado);
                          
                          return (
                            <div key={busqueda.id} className="list-group-item">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">{busqueda.titulo}</h6>
                                  <p className="mb-1 text-muted">{busqueda.descripcion}</p>
                                  <div className="d-flex align-items-center">
                                    <span className={`badge bg-${estadoBadge.color} me-2`}>
                                      {estadoBadge.text}
                                    </span>
                                    <small className="text-muted">
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {busqueda.ubicacion}
                                    </small>
                                    <small className="text-muted ms-3">
                                      <i className="bi bi-currency-dollar me-1"></i>
                                      ${busqueda.salario_minimo} - ${busqueda.salario_maximo}
                                    </small>
                                  </div>
                                </div>
                                <div>
                                  {yaVinculada ? (
                                    <span className="badge bg-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Vinculado
                                    </span>
                                  ) : (
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => vincularBusqueda(busqueda.id)}
                                      disabled={vinculando === busqueda.id}
                                    >
                                      {vinculando === busqueda.id ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-1"></span>
                                          Vinculando...
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-plus-circle me-1"></i>
                                          Vincular
                                        </>
                                      )}
                                    </button>
                                  )}
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

              {/* Búsquedas Vinculadas */}
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="bi bi-link me-2"></i>
                      Vinculaciones Actuales
                      <span className="badge bg-primary ms-2">{busquedasVinculadas.length}</span>
                    </h6>
                  </div>
                  <div className="card-body">
                    {busquedasVinculadas.length === 0 ? (
                      <div className="text-center text-muted py-3">
                        <i className="bi bi-link-45deg fs-1"></i>
                        <p className="mt-2 mb-0">Sin vinculaciones</p>
                        <small>Selecciona búsquedas de la lista</small>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {busquedasVinculadas.map(vinculacion => (
                          <div key={vinculacion.id} className="list-group-item px-0">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1 fs-6">{vinculacion.busqueda_laboral?.titulo}</h6>
                                <small className="text-muted d-block mb-1">
                                  Vinculado: {new Date(vinculacion.created_at).toLocaleDateString('es-ES')}
                                </small>
                                {vinculacion.busqueda_laboral?.estado && (
                                  <span className={`badge bg-${getEstadoBadge(vinculacion.busqueda_laboral.estado).color}`} style={{fontSize: '0.7em'}}>
                                    {getEstadoBadge(vinculacion.busqueda_laboral.estado).text}
                                  </span>
                                )}
                              </div>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => desvincularBusqueda(vinculacion.id)}
                                disabled={vinculando === vinculacion.id}
                                title="Desvincular"
                              >
                                {vinculando === vinculacion.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <i className="bi bi-x-circle"></i>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cerrar
            </button>
            <div className="text-muted">
              <small>
                <i className="bi bi-info-circle me-1"></i>
                Las vinculaciones permiten hacer seguimiento de candidatos para búsquedas específicas
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
