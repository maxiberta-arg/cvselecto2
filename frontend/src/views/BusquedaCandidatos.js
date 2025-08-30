import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function BusquedaCandidatos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    q: '',
    nivel_educacion: '',
    experiencia_min: '',
    experiencia_max: '',
    modalidad: '',
    disponibilidad: ''
  });

  // Opciones para los filtros
  const nivelesEducacion = [
    { value: 'sin_estudios', label: 'Sin estudios formales' },
    { value: 'primario', label: 'Primario' },
    { value: 'secundario', label: 'Secundario' },
    { value: 'terciario', label: 'Terciario' },
    { value: 'universitario', label: 'Universitario' },
    { value: 'posgrado', label: 'Posgrado' }
  ];

  const modalidades = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'remoto', label: 'Remoto' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  const disponibilidades = [
    { value: 'inmediata', label: 'Inmediata' },
    { value: '15_dias', label: '15 días' },
    { value: '30_dias', label: '30 días' },
    { value: 'a_convenir', label: 'A convenir' }
  ];

  // Buscar candidatos
  const buscarCandidatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/candidatos-search?${params.toString()}`);
      setCandidatos(response.data);
    } catch (err) {
      console.error('Error al buscar candidatos:', err);
      setError('Error al buscar candidatos');
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda automática cuando cambian los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filtros.q.length >= 2 || Object.values(filtros).some(v => v && v !== filtros.q)) {
        buscarCandidatos();
      } else if (filtros.q === '') {
        setCandidatos([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filtros]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const resetFiltros = () => {
    setFiltros({
      q: '',
      nivel_educacion: '',
      experiencia_min: '',
      experiencia_max: '',
      modalidad: '',
      disponibilidad: ''
    });
    setCandidatos([]);
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)' }}>
                      <i className="bi bi-search text-white" style={{ fontSize: '1.8rem' }}></i>
                    </div>
                    <div>
                      <h3 className="fw-bold text-white mb-1">Búsqueda de Candidatos</h3>
                      <p className="text-white-50 mb-0">Encuentra candidatos ideales para tus búsquedas</p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-light"
                    onClick={() => navigate('/empresa')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver al Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de Búsqueda */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-funnel me-2"></i>
                  Filtros de Búsqueda
                </h5>
                
                <div className="row g-3">
                  {/* Búsqueda por término */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Búsqueda general</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nombre, habilidades, experiencia..."
                      value={filtros.q}
                      onChange={(e) => handleFiltroChange('q', e.target.value)}
                    />
                  </div>
                  
                  {/* Nivel de educación */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Nivel de Educación</label>
                    <select 
                      className="form-select"
                      value={filtros.nivel_educacion}
                      onChange={(e) => handleFiltroChange('nivel_educacion', e.target.value)}
                    >
                      <option value="">Todos los niveles</option>
                      {nivelesEducacion.map(nivel => (
                        <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Experiencia */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Años de Experiencia</label>
                    <div className="row g-2">
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Mín"
                          min="0"
                          value={filtros.experiencia_min}
                          onChange={(e) => handleFiltroChange('experiencia_min', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Máx"
                          min="0"
                          value={filtros.experiencia_max}
                          onChange={(e) => handleFiltroChange('experiencia_max', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Modalidad */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Modalidad Preferida</label>
                    <select 
                      className="form-select"
                      value={filtros.modalidad}
                      onChange={(e) => handleFiltroChange('modalidad', e.target.value)}
                    >
                      <option value="">Todas las modalidades</option>
                      {modalidades.map(modalidad => (
                        <option key={modalidad.value} value={modalidad.value}>{modalidad.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-12 d-flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={buscarCandidatos}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Buscando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-2"></i>
                          Buscar
                        </>
                      )}
                    </button>
                    
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={resetFiltros}
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

        {/* Error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Resultados */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-people me-2"></i>
                    Candidatos Encontrados ({candidatos.length})
                  </h5>
                </div>

                {candidatos.length === 0 && !loading && (
                  <div className="text-center py-5">
                    <i className="bi bi-search text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h6 className="text-muted">
                      {filtros.q || Object.values(filtros).some(v => v && v !== filtros.q) 
                        ? 'No se encontraron candidatos con estos criterios'
                        : 'Utiliza los filtros para buscar candidatos'
                      }
                    </h6>
                  </div>
                )}

                {candidatos.length > 0 && (
                  <div className="row g-3">
                    {candidatos.map((candidato) => (
                      <div key={candidato.id} className="col-lg-6 col-xl-4">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-3">
                              <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3" style={{ width: 50, height: 50 }}>
                                <i className="bi bi-person-fill text-primary"></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1">
                                  {candidato.nombre} {candidato.apellido}
                                </h6>
                                <small className="text-muted">
                                  {candidato.email}
                                </small>
                              </div>
                            </div>
                            
                            {candidato.habilidades && (
                              <div className="mb-2">
                                <small className="text-muted d-block">Habilidades:</small>
                                <span className="small">{candidato.habilidades}</span>
                              </div>
                            )}
                            
                            {candidato.experiencia_anos && (
                              <div className="mb-2">
                                <small className="text-muted d-block">Experiencia:</small>
                                <span className="small">{candidato.experiencia_anos} años</span>
                              </div>
                            )}
                            
                            <div className="d-flex gap-2 mt-3">
                              <button 
                                className="btn btn-outline-primary btn-sm flex-fill"
                                onClick={() => navigate(`/candidatos/${candidato.id}`)}
                              >
                                <i className="bi bi-eye me-1"></i>
                                Ver Perfil
                              </button>
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

      </div>
    </div>
  );
}
