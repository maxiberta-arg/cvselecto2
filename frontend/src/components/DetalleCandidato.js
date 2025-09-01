import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function DetalleCandidato({ candidatoId, empresaCandidatoId, show, onHide, onUpdate }) {
  const [candidato, setCandidato] = useState(null);
  const [empresaCandidato, setEmpresaCandidato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Estados editables
  const [notasPrivadas, setNotasPrivadas] = useState('');
  const [puntuacionEmpresa, setPuntuacionEmpresa] = useState('');
  const [tags, setTags] = useState([]);
  const [nuevoTag, setNuevoTag] = useState('');

  useEffect(() => {
    if (show && candidatoId) {
      cargarDetalleCandidato();
    }
  }, [show, candidatoId]);

  const cargarDetalleCandidato = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del candidato
      const [candidatoResponse, empresaPoolResponse] = await Promise.all([
        api.get(`/candidatos/${candidatoId}`),
        api.get(`/pool-candidatos/candidato/${empresaCandidatoId}`)
      ]);
      
      const candidatoData = candidatoResponse.data;
      const empresaCandidatoData = empresaPoolResponse.data.data;
      
      setCandidato(candidatoData);
      setEmpresaCandidato(empresaCandidatoData);
      
      // Inicializar campos editables
      setNotasPrivadas(empresaCandidatoData.notas_privadas || '');
      setPuntuacionEmpresa(empresaCandidatoData.puntuacion_empresa || '');
      setTags(empresaCandidatoData.tags || []);
      
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      toast.error('Error al cargar los datos del candidato');
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async () => {
    try {
      setGuardando(true);
      
      const response = await api.put(`/pool-candidatos/candidato/${candidatoId}`, {
        notas_privadas: notasPrivadas,
        puntuacion_empresa: puntuacionEmpresa ? parseFloat(puntuacionEmpresa) : null,
        tags: tags
      });
      
      if (response.data.success) {
        toast.success('Cambios guardados correctamente');
        onUpdate && onUpdate();
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const agregarTag = () => {
    if (nuevoTag.trim() && !tags.includes(nuevoTag.trim())) {
      setTags([...tags, nuevoTag.trim()]);
      setNuevoTag('');
    }
  };

  const quitarTag = (tagAQuitar) => {
    setTags(tags.filter(tag => tag !== tagAQuitar));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarTag();
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-circle me-2"></i>
              Detalle del Candidato
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
            ></button>
          </div>
          
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : candidato ? (
              <>
                {/* Header del candidato */}
                <div className="row mb-4">
                  <div className="col-md-3 text-center">
                    {candidato.avatar ? (
                      <img 
                        src={`http://localhost:8000${candidato.avatar}`}
                        alt="Avatar" 
                        className="img-fluid rounded-circle mb-3"
                        style={{maxWidth: '150px', maxHeight: '150px'}}
                      />
                    ) : (
                      <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                           style={{width: '150px', height: '150px'}}>
                        <i className="bi bi-person fs-1 text-muted"></i>
                      </div>
                    )}
                    <h4>{candidato.user?.name || `${candidato.nombre || ''} ${candidato.apellido || ''}`.trim()}</h4>
                    <p className="text-muted">{candidato.email}</p>
                  </div>
                  <div className="col-md-9">
                    <div className="row">
                      <div className="col-md-6">
                        <strong>Estado en Pool:</strong>
                        <span className={`badge ms-2 ${getBadgeColor(empresaCandidato?.estado_interno)}`}>
                          {empresaCandidato?.estado_interno?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="col-md-6">
                        <strong>Origen:</strong>
                        <span className="badge bg-light text-dark ms-2">{empresaCandidato?.origen}</span>
                      </div>
                      <div className="col-md-6 mt-2">
                        <strong>Fecha Incorporación:</strong>
                        <span className="ms-2">
                          {empresaCandidato?.fecha_incorporacion ? 
                           new Date(empresaCandidato.fecha_incorporacion).toLocaleDateString('es-ES') : 
                           'No registrada'}
                        </span>
                      </div>
                      <div className="col-md-6 mt-2">
                        <strong>Teléfono:</strong>
                        <span className="ms-2">{candidato.telefono || 'No registrado'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                      onClick={() => setActiveTab('general')}
                    >
                      <i className="bi bi-person me-1"></i>Información General
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'experiencia' ? 'active' : ''}`}
                      onClick={() => setActiveTab('experiencia')}
                    >
                      <i className="bi bi-briefcase me-1"></i>Experiencia
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'educacion' ? 'active' : ''}`}
                      onClick={() => setActiveTab('educacion')}
                    >
                      <i className="bi bi-mortarboard me-1"></i>Educación
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'empresa' ? 'active' : ''}`}
                      onClick={() => setActiveTab('empresa')}
                    >
                      <i className="bi bi-building me-1"></i>Datos Empresa
                    </button>
                  </li>
                </ul>

                {/* Contenido de tabs */}
                <div className="tab-content">
                  {activeTab === 'general' && (
                    <div className="tab-pane fade show active">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">Información Personal</h6>
                              <table className="table table-sm">
                                <tbody>
                                  <tr>
                                    <td><strong>Fecha Nacimiento:</strong></td>
                                    <td>{candidato.fecha_nacimiento ? new Date(candidato.fecha_nacimiento).toLocaleDateString('es-ES') : 'No registrada'}</td>
                                  </tr>
                                  <tr>
                                    <td><strong>Dirección:</strong></td>
                                    <td>{candidato.direccion || 'No registrada'}</td>
                                  </tr>
                                  <tr>
                                    <td><strong>LinkedIn:</strong></td>
                                    <td>
                                      {candidato.linkedin_url ? (
                                        <a href={candidato.linkedin_url} target="_blank" rel="noopener noreferrer">
                                          Ver perfil <i className="bi bi-box-arrow-up-right"></i>
                                        </a>
                                      ) : 'No registrado'}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td><strong>Portfolio:</strong></td>
                                    <td>
                                      {candidato.portfolio_url ? (
                                        <a href={candidato.portfolio_url} target="_blank" rel="noopener noreferrer">
                                          Ver portfolio <i className="bi bi-box-arrow-up-right"></i>
                                        </a>
                                      ) : 'No registrado'}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">Habilidades y Preferencias</h6>
                              <div className="mb-3">
                                <strong>Habilidades:</strong>
                                <p className="mt-1">{candidato.habilidades || 'No registradas'}</p>
                              </div>
                              <div className="mb-3">
                                <strong>Disponibilidad:</strong>
                                <span className="badge bg-info ms-2">{candidato.disponibilidad || 'No especificada'}</span>
                              </div>
                              <div className="mb-3">
                                <strong>Modalidad Preferida:</strong>
                                <span className="badge bg-info ms-2">{candidato.modalidad_preferida || 'No especificada'}</span>
                              </div>
                              <div>
                                <strong>Pretensión Salarial:</strong>
                                <span className="ms-2">
                                  {candidato.pretension_salarial ? `$${candidato.pretension_salarial}` : 'No especificada'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {candidato.bio && (
                        <div className="card mt-3">
                          <div className="card-body">
                            <h6 className="card-title">Biografía</h6>
                            <p>{candidato.bio}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'experiencia' && (
                    <div className="tab-pane fade show active">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">Experiencia Laboral</h6>
                          {candidato.experiencia_resumida ? (
                            <div>
                              <div className="mb-3">
                                <strong>Años de experiencia:</strong>
                                <span className="ms-2">{candidato.experiencia_anos || 'No especificados'}</span>
                              </div>
                              <div>
                                <strong>Resumen:</strong>
                                <p className="mt-2">{candidato.experiencia_resumida}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted">No hay información de experiencia registrada</p>
                          )}
                          
                          {candidato.cv_path && (
                            <div className="mt-3">
                              <strong>CV:</strong>
                              <a 
                                href={`http://localhost:8000${candidato.cv_path}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm ms-2"
                              >
                                <i className="bi bi-file-pdf me-1"></i>Descargar CV
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'educacion' && (
                    <div className="tab-pane fade show active">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">Educación</h6>
                          {candidato.educacion_resumida || candidato.nivel_educacion ? (
                            <div>
                              {candidato.nivel_educacion && (
                                <div className="mb-3">
                                  <strong>Nivel Educativo:</strong>
                                  <span className="badge bg-success ms-2">{candidato.nivel_educacion}</span>
                                </div>
                              )}
                              {candidato.educacion_resumida && (
                                <div>
                                  <strong>Resumen:</strong>
                                  <p className="mt-2">{candidato.educacion_resumida}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted">No hay información educativa registrada</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'empresa' && (
                    <div className="tab-pane fade show active">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">Puntuación</h6>
                              <div className="mb-3">
                                <label className="form-label">Puntuación Empresa (0-10)</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={puntuacionEmpresa}
                                  onChange={(e) => setPuntuacionEmpresa(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="card mt-3">
                            <div className="card-body">
                              <h6 className="card-title">Tags</h6>
                              <div className="mb-3">
                                {tags.map((tag, index) => (
                                  <span key={index} className="badge bg-info me-1 mb-1">
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
                              <div className="input-group">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Agregar tag..."
                                  value={nuevoTag}
                                  onChange={(e) => setNuevoTag(e.target.value)}
                                  onKeyPress={handleKeyPress}
                                />
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={agregarTag}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">Notas Privadas</h6>
                              <textarea
                                className="form-control"
                                rows="8"
                                placeholder="Agregar notas internas sobre este candidato..."
                                value={notasPrivadas}
                                onChange={(e) => setNotasPrivadas(e.target.value)}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="alert alert-danger">
                No se pudieron cargar los datos del candidato
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cerrar
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={guardarCambios}
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check me-1"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Función auxiliar para colores de badges (puede ser movida a un utils si se necesita en otros lados)
function getBadgeColor(estado) {
  const colores = {
    'activo': 'bg-success',
    'en_proceso': 'bg-info',
    'contratado': 'bg-primary',
    'descartado': 'bg-danger',
    'pausado': 'bg-warning'
  };
  return colores[estado] || 'bg-secondary';
}
