import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

// Importar componentes nuevos
import DetalleCandidato from '../components/DetalleCandidato';
import EdicionRapidaCandidato from '../components/EdicionRapidaCandidato';
import TarjetaCandidatoResponsiva from '../components/TarjetaCandidatoResponsiva';
import VincularBusquedas from '../components/VincularBusquedas';

export default function PoolCandidatos() {
  const { user } = useAuth();
  
  // Estados
  const [candidatos, setCandidatos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [candidatosPotenciales, setCandidatosPotenciales] = useState([]);
  
  // Estado de paginación
  const [paginacion, setPaginacion] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });
  
  // Filtros
  const [filtros, setFiltros] = useState({
    estado_interno: '',
    origen: '',
    puntuacion_min: '',
    puntuacion_max: '',
    search: '',
    tags: [],
    fecha_incorporacion_desde: '',
    fecha_incorporacion_hasta: '',
    page: 1,
    per_page: 15
  });

  // Estado para filtros avanzados
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [tagsDisponibles, setTagsDisponibles] = useState([]);

  // Estados para modals nuevos
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarEdicionRapida, setMostrarEdicionRapida] = useState(false);
  const [mostrarVincularBusquedas, setMostrarVincularBusquedas] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion: '',
    nivel_educacion: '',
    experiencia_anos: '',
    disponibilidad: '',
    modalidad_preferida: '',
    pretension_salarial: '',
    linkedin_url: '',
    portfolio_url: '',
    tags: [],
    notas_privadas: '',
    puntuacion_empresa: ''
  });

  const [nuevoTag, setNuevoTag] = useState('');

  // Cargar datos al montar el componente
  // Llamadas iniciales que pueden invocar funciones definidas en el componente.
  // Se mantiene la intención de ejecutar estas llamadas al montar/cambiar `user`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user && user.rol === 'empresa') {
      cargarPoolCandidatos(false);
      cargarEstadisticas();
      cargarTagsDisponibles();
    }
  }, [user]);

  // Recargar cuando cambien los filtros (excepto page)
  // Debounce para filtros: intencionalmente no incluimos `cargarPoolCandidatos`
  // en las dependencias para evitar re-ejecuciones innecesarias.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user && user.rol === 'empresa') {
        const { page, ...otherFilters } = filtros;
        const filtersChanged = JSON.stringify(otherFilters) !== JSON.stringify({
          estado_interno: '',
          origen: '',
          puntuacion_min: '',
          puntuacion_max: '',
          search: '',
          per_page: 15
        });
        
        // Si los filtros cambiaron, resetear a página 1
        cargarPoolCandidatos(filtersChanged);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filtros.estado_interno, filtros.origen, filtros.puntuacion_min, filtros.puntuacion_max, filtros.search]);

  // Cargar cuando cambie la página (sin delay)
  // Cambio de página: la función `cargarPoolCandidatos` se llama deliberadamente
  // sin declararla en las dependencias del hook.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user && user.rol === 'empresa' && filtros.page > 1) {
      cargarPoolCandidatos(false);
    }
  }, [filtros.page]);

  const cargarPoolCandidatos = async (resetPage = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Si se resetea la página (nuevo filtro), ir a página 1
      const currentFilters = resetPage ? { ...filtros, page: 1 } : filtros;
      if (resetPage) {
        setFiltros(currentFilters);
      }
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/pool-candidatos?${params}`);
      if (response.data.success) {
        const data = response.data.data;
        setCandidatos(data.data || []);
        setPaginacion({
          current_page: data.current_page,
          per_page: data.per_page,
          total: data.total,
          last_page: data.last_page,
          from: data.from || 0,
          to: data.to || 0
        });
      }
    } catch (error) {
      console.error('Error al cargar pool de candidatos:', error);
      toast.error('Error al cargar candidatos del pool');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await api.get('/pool-candidatos/estadisticas');
      if (response.data.success) {
        setEstadisticas(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  // Cargar tags únicos disponibles
  const cargarTagsDisponibles = async () => {
    try {
      const response = await api.get('/pool-candidatos/tags');
      if (response.data.success) {
        setTagsDisponibles(response.data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar tags:', error);
    }
  };

  const cargarCandidatosPotenciales = async () => {
    try {
      const response = await api.get('/candidatos');
      setCandidatosPotenciales(response.data || []);
    } catch (error) {
      console.error('Error al cargar candidatos:', error);
      toast.error('Error al cargar candidatos disponibles');
    }
  };

  const crearCandidato = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await api.post('/pool-candidatos/crear-candidato', formData);
      
      if (response.data.success) {
        toast.success('Candidato creado y agregado al pool exitosamente');
        setMostrarModalCrear(false);
        limpiarFormulario();
        cargarPoolCandidatos(false);
        cargarEstadisticas();
      }
    } catch (error) {
      console.error('Error al crear candidato:', error);
      
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach(errors => {
          errors.forEach(error => toast.error(error));
        });
      } else {
        toast.error(error.response?.data?.message || 'Error al crear candidato');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const agregarExistente = async (candidatoId) => {
    setActionLoading(true);

    try {
      const response = await api.post('/pool-candidatos/agregar-existente', {
        candidato_id: candidatoId,
        origen: 'manual'
      });
      
      if (response.data.success) {
        toast.success('Candidato agregado al pool exitosamente');
        setMostrarModalAgregar(false);
        cargarPoolCandidatos(false);
        cargarEstadisticas();
      }
    } catch (error) {
      console.error('Error al agregar candidato:', error);
      toast.error(error.response?.data?.message || 'Error al agregar candidato al pool');
    } finally {
      setActionLoading(false);
    }
  };

  const cambiarEstado = async (candidatoId, nuevoEstado) => {
    setActionLoading(true);

    try {
      const response = await api.put(`/pool-candidatos/candidato/${candidatoId}`, {
        estado_interno: nuevoEstado,
        observaciones: `Cambio de estado a ${nuevoEstado}`
      });
      
      if (response.data.success) {
        toast.success('Estado actualizado exitosamente');
        cargarPoolCandidatos(false);
        cargarEstadisticas();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado del candidato');
    } finally {
      setActionLoading(false);
    }
  };

  const calificarCandidato = async (candidatoId) => {
    const puntuacion = prompt('Puntuación (0-10):');
    const notas = prompt('Notas adicionales:');
    
    if (puntuacion !== null && puntuacion.trim() !== '') {
      const puntuacionNum = parseFloat(puntuacion);
      if (puntuacionNum >= 0 && puntuacionNum <= 10) {
        setActionLoading(true);
        
        try {
          const response = await api.put(`/pool-candidatos/candidato/${candidatoId}`, {
            puntuacion_empresa: puntuacionNum,
            notas_privadas: notas || '',
            observaciones: 'Actualización de calificación'
          });
          
          if (response.data.success) {
            toast.success('Candidato calificado exitosamente');
            cargarPoolCandidatos(false);
            cargarEstadisticas();
          }
        } catch (error) {
          console.error('Error al calificar candidato:', error);
          toast.error('Error al calificar candidato');
        } finally {
          setActionLoading(false);
        }
      } else {
        toast.error('La puntuación debe ser entre 0 y 10');
      }
    }
  };

  const eliminarDelPool = async (candidatoId, nombreCandidato) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombreCandidato} del pool?`)) {
      setActionLoading(true);
      
      try {
        const response = await api.delete(`/pool-candidatos/candidato/${candidatoId}`);
        
        if (response.data.success) {
          toast.success('Candidato eliminado del pool');
          cargarPoolCandidatos(false);
          cargarEstadisticas();
        }
      } catch (error) {
        console.error('Error al eliminar candidato:', error);
        toast.error('Error al eliminar candidato del pool');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const agregarTag = () => {
    if (nuevoTag.trim() && !formData.tags.includes(nuevoTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, nuevoTag.trim()]
      });
      setNuevoTag('');
    }
  };

  const quitarTag = (tagAQuitar) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagAQuitar)
    });
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      direccion: '',
      nivel_educacion: '',
      experiencia_anos: '',
      disponibilidad: '',
      modalidad_preferida: '',
      pretension_salarial: '',
      linkedin_url: '',
      portfolio_url: '',
      tags: [],
      notas_privadas: '',
      puntuacion_empresa: ''
    });
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros({
      ...filtros,
      [campo]: valor
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado_interno: '',
      origen: '',
      puntuacion_min: '',
      puntuacion_max: '',
      search: '',
      page: 1,
      per_page: 15
    });
  };

  // Función para cambiar de página
  const cambiarPagina = (nuevaPagina) => {
    setFiltros({
      ...filtros,
      page: nuevaPagina
    });
  };

  // Función para cambiar items per página
  const cambiarItemsPorPagina = (nuevoPerPage) => {
    setFiltros({
      ...filtros,
      per_page: nuevoPerPage,
      page: 1
    });
  };

  // Funciones para manejar los modals nuevos
  const abrirDetalleCandidato = (candidato) => {
    setCandidatoSeleccionado(candidato);
    setMostrarDetalle(true);
  };

  const abrirEdicionRapida = (candidato) => {
    setCandidatoSeleccionado(candidato);
    setMostrarEdicionRapida(true);
  };

  const abrirVincularBusquedas = (candidato) => {
    setCandidatoSeleccionado(candidato);
    setMostrarVincularBusquedas(true);
  };

  const cerrarModals = () => {
    setCandidatoSeleccionado(null);
    setMostrarDetalle(false);
    setMostrarEdicionRapida(false);
    setMostrarVincularBusquedas(false);
  };

  const handleUpdateCandidato = () => {
    cargarPoolCandidatos(false);
    cargarEstadisticas();
  };

  const getBadgeColor = (estado) => {
    const colores = {
      'activo': 'bg-success',
      'en_proceso': 'bg-info',
      'contratado': 'bg-primary',
      'descartado': 'bg-danger',
      'pausado': 'bg-warning'
    };
    return colores[estado] || 'bg-secondary';
  };

  const getOrigenColor = (origen) => {
    const colores = {
      'postulacion': 'bg-info',
      'manual': 'bg-success',
      'importacion': 'bg-primary',
      'referido': 'bg-warning'
    };
    return colores[origen] || 'bg-secondary';
  };

  if (!user || user.rol !== 'empresa') {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Esta sección es solo para empresas
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-collection me-2"></i>
          Pool de Candidatos
        </h2>
        <div className="btn-group">
          <button 
            className="btn btn-success"
            onClick={() => setMostrarModalCrear(true)}
          >
            <i className="bi bi-person-plus me-1"></i>
            Crear Candidato
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setMostrarModalAgregar(true);
              cargarCandidatosPotenciales();
            }}
          >
            <i className="bi bi-person-check me-1"></i>
            Agregar Existente
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{estadisticas.total_candidatos || 0}</h3>
                <small>Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{estadisticas.activos || 0}</h3>
                <small>Activos</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{estadisticas.en_proceso || 0}</h3>
                <small>En Proceso</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{estadisticas.contratados || 0}</h3>
                <small>Contratados</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-danger text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{estadisticas.descartados || 0}</h3>
                <small>Descartados</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-dark text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{estadisticas.promedio_puntuacion ? parseFloat(estadisticas.promedio_puntuacion).toFixed(1) : 'N/A'}</h3>
                <small>Promedio</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-2">
              <label className="form-label">Estado:</label>
              <select 
                className="form-select form-select-sm"
                value={filtros.estado_interno}
                onChange={(e) => handleFiltroChange('estado_interno', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="en_proceso">En Proceso</option>
                <option value="contratado">Contratado</option>
                <option value="descartado">Descartado</option>
                <option value="pausado">Pausado</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Origen:</label>
              <select 
                className="form-select form-select-sm"
                value={filtros.origen}
                onChange={(e) => handleFiltroChange('origen', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="postulacion">Postulación</option>
                <option value="manual">Manual</option>
                <option value="importacion">Importación</option>
                <option value="referido">Referido</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Punt. Mín:</label>
              <input 
                type="number"
                className="form-control form-control-sm"
                placeholder="0"
                min="0"
                max="10"
                step="0.1"
                value={filtros.puntuacion_min}
                onChange={(e) => handleFiltroChange('puntuacion_min', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Punt. Máx:</label>
              <input 
                type="number"
                className="form-control form-control-sm"
                placeholder="10"
                min="0"
                max="10"
                step="0.1"
                value={filtros.puntuacion_max}
                onChange={(e) => handleFiltroChange('puntuacion_max', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Búsqueda:</label>
              <input 
                type="text"
                className="form-control form-control-sm"
                placeholder="Nombre, email..."
                value={filtros.search}
                onChange={(e) => handleFiltroChange('search', e.target.value)}
              />
            </div>
            <div className="col-md-1">
              <button 
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={limpiarFiltros}
                title="Limpiar filtros"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Candidatos */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-people me-2"></i>
            Candidatos en el Pool
            <span className="badge bg-secondary ms-2">{candidatos.length}</span>
          </h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : candidatos.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
              <h6 className="text-muted">No hay candidatos en el pool</h6>
              <p className="text-muted">Agrega candidatos para comenzar a gestionar tu pool de talento</p>
            </div>
          ) : (
            <div className="row g-3">
              {candidatos.map((candidatoPool, index) => (
                <div key={candidatoPool.id} className="col-12">
                  <TarjetaCandidatoResponsiva
                    candidato={candidatoPool}
                    onVerDetalle={abrirDetalleCandidato}
                    onEdicionRapida={abrirEdicionRapida}
                    onEliminar={(candidato) => eliminarDelPool(
                      candidato.candidato_id,
                      candidato.candidato?.user?.name || 
                      `${candidato.candidato?.nombre || ''} ${candidato.candidato?.apellido || ''}`.trim() || 
                      'este candidato'
                    )}
                    actionLoading={actionLoading}
                    index={index}
                  />
                </div>
              ))}
            </div>
          )}
            
            {/* Paginación */}
            {candidatos.length > 0 && paginacion.last_page > 1 && (
              <div className="row mt-3 align-items-center">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <span className="text-muted me-2">Mostrar:</span>
                    <select 
                      className="form-select form-select-sm" 
                      style={{width: 'auto'}}
                      value={filtros.per_page}
                      onChange={(e) => cambiarItemsPorPagina(parseInt(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-muted ms-2">
                      de {paginacion.total} candidatos
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <nav aria-label="Paginación de candidatos">
                    <ul className="pagination pagination-sm justify-content-end mb-0">
                      <li className={`page-item ${paginacion.current_page === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => cambiarPagina(paginacion.current_page - 1)}
                          disabled={paginacion.current_page === 1}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      
                      {/* Páginas numéricas */}
                      {(() => {
                        const pages = [];
                        const current = paginacion.current_page;
                        const last = paginacion.last_page;
                        
                        // Mostrar primera página si no está cerca
                        if (current > 3) {
                          pages.push(
                            <li key={1} className="page-item">
                              <button className="page-link" onClick={() => cambiarPagina(1)}>1</button>
                            </li>
                          );
                          if (current > 4) {
                            pages.push(<li key="dots1" className="page-item disabled"><span className="page-link">...</span></li>);
                          }
                        }
                        
                        // Páginas alrededor de la actual
                        for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
                          pages.push(
                            <li key={i} className={`page-item ${i === current ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => cambiarPagina(i)}>{i}</button>
                            </li>
                          );
                        }
                        
                        // Mostrar última página si no está cerca
                        if (current < last - 2) {
                          if (current < last - 3) {
                            pages.push(<li key="dots2" className="page-item disabled"><span className="page-link">...</span></li>);
                          }
                          pages.push(
                            <li key={last} className="page-item">
                              <button className="page-link" onClick={() => cambiarPagina(last)}>{last}</button>
                            </li>
                          );
                        }
                        
                        return pages;
                      })()}
                      
                      <li className={`page-item ${paginacion.current_page === paginacion.last_page ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => cambiarPagina(paginacion.current_page + 1)}
                          disabled={paginacion.current_page === paginacion.last_page}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Modal Crear Candidato */}
      {mostrarModalCrear && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nuevo Candidato</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setMostrarModalCrear(false)}
                ></button>
              </div>
              <form onSubmit={crearCandidato}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Nombre *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nombre}
                          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Apellido *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.apellido}
                          onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.telefono}
                          onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.fecha_nacimiento}
                          onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Años de Experiencia</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          value={formData.experiencia_anos}
                          onChange={(e) => setFormData({...formData, experiencia_anos: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Dirección</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.direccion}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Nivel de Educación</label>
                        <select
                          className="form-select"
                          value={formData.nivel_educacion}
                          onChange={(e) => setFormData({...formData, nivel_educacion: e.target.value})}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="secundario">Secundario</option>
                          <option value="terciario">Terciario</option>
                          <option value="universitario">Universitario</option>
                          <option value="posgrado">Posgrado</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Disponibilidad</label>
                        <select
                          className="form-select"
                          value={formData.disponibilidad}
                          onChange={(e) => setFormData({...formData, disponibilidad: e.target.value})}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="inmediata">Inmediata</option>
                          <option value="1-semana">1 semana</option>
                          <option value="2-semanas">2 semanas</option>
                          <option value="1-mes">1 mes</option>
                          <option value="mas-1-mes">Más de 1 mes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Modalidad Preferida</label>
                        <select
                          className="form-select"
                          value={formData.modalidad_preferida}
                          onChange={(e) => setFormData({...formData, modalidad_preferida: e.target.value})}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="presencial">Presencial</option>
                          <option value="remoto">Remoto</option>
                          <option value="hibrido">Híbrido</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Pretensión Salarial</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          value={formData.pretension_salarial}
                          onChange={(e) => setFormData({...formData, pretension_salarial: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">LinkedIn URL</label>
                        <input
                          type="url"
                          className="form-control"
                          value={formData.linkedin_url}
                          onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Portfolio URL</label>
                        <input
                          type="url"
                          className="form-control"
                          value={formData.portfolio_url}
                          onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Agregar tag"
                        value={nuevoTag}
                        onChange={(e) => setNuevoTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            agregarTag();
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={agregarTag}
                      >
                        Agregar
                      </button>
                    </div>
                    <div className="mt-2">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="badge bg-primary me-1">
                          {tag}
                          <button 
                            type="button"
                            className="btn-close btn-close-white ms-1" 
                            style={{fontSize: '0.6em'}}
                            onClick={() => quitarTag(tag)}
                          ></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Puntuación Inicial (0-10)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="10"
                          step="0.1"
                          value={formData.puntuacion_empresa}
                          onChange={(e) => setFormData({...formData, puntuacion_empresa: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Notas Privadas</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.notas_privadas}
                      onChange={(e) => setFormData({...formData, notas_privadas: e.target.value})}
                      placeholder="Notas internas sobre el candidato..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setMostrarModalCrear(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Creando...' : 'Crear Candidato'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Existente */}
      {mostrarModalAgregar && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Agregar Candidato Existente</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setMostrarModalAgregar(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive" style={{maxHeight: '400px'}}>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Candidato</th>
                        <th>Email</th>
                        <th>Experiencia</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidatosPotenciales.map(candidato => (
                        <tr key={candidato.id}>
                          <td>
                            <strong>{candidato.name}</strong>
                            {candidato.apellido && (
                              <div className="small text-muted">{candidato.apellido}</div>
                            )}
                          </td>
                          <td>
                            <small>{candidato.email}</small>
                          </td>
                          <td>
                            <small>
                              {candidato.experiencia_anos ? `${candidato.experiencia_anos} años` : 'N/A'}
                            </small>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => agregarExistente(candidato.id)}
                              disabled={actionLoading}
                            >
                              <i className="bi bi-plus"></i> Agregar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setMostrarModalAgregar(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Candidato */}
      {mostrarDetalle && candidatoSeleccionado && (
        <DetalleCandidato
          candidatoId={candidatoSeleccionado.candidato_id}
          empresaCandidatoId={candidatoSeleccionado.id}
          show={mostrarDetalle}
          onHide={cerrarModals}
          onUpdate={handleUpdateCandidato}
        />
      )}

      {/* Modal Edición Rápida */}
      {mostrarEdicionRapida && candidatoSeleccionado && (
        <EdicionRapidaCandidato
          candidato={candidatoSeleccionado}
          show={mostrarEdicionRapida}
          onHide={cerrarModals}
          onUpdate={handleUpdateCandidato}
        />
      )}

      {/* Modal Vincular Búsquedas */}
      {mostrarVincularBusquedas && candidatoSeleccionado && (
        <VincularBusquedas
          candidato={candidatoSeleccionado}
          show={mostrarVincularBusquedas}
          onHide={cerrarModals}
          onUpdate={handleUpdateCandidato}
        />
      )}
    </div>
  );
}
