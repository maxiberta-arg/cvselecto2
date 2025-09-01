import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function EdicionRapidaCandidato({ candidato, show, onHide, onUpdate }) {
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    estado_interno: '',
    puntuacion_empresa: '',
    notas_privadas: '',
    tags: []
  });
  const [nuevoTag, setNuevoTag] = useState('');

  // Estados disponibles
  const estadosDisponibles = [
    { value: 'activo', label: 'Activo', color: 'success' },
    { value: 'en_proceso', label: 'En Proceso', color: 'info' },
    { value: 'contratado', label: 'Contratado', color: 'primary' },
    { value: 'descartado', label: 'Descartado', color: 'danger' },
    { value: 'pausado', label: 'Pausado', color: 'warning' }
  ];

  useEffect(() => {
    if (show && candidato) {
      setFormData({
        estado_interno: candidato.estado_interno || 'activo',
        puntuacion_empresa: candidato.puntuacion_empresa || '',
        notas_privadas: candidato.notas_privadas || '',
        tags: candidato.tags || []
      });
    }
  }, [show, candidato]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const agregarTag = () => {
    if (nuevoTag.trim() && !formData.tags.includes(nuevoTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, nuevoTag.trim()]
      }));
      setNuevoTag('');
    }
  };

  const quitarTag = (tagAQuitar) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagAQuitar)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarTag();
    }
  };

  const guardarCambios = async () => {
    try {
      setGuardando(true);
      
      const response = await api.put(`/pool-candidatos/candidato/${candidato.candidato_id}`, {
        estado_interno: formData.estado_interno,
        puntuacion_empresa: formData.puntuacion_empresa ? parseFloat(formData.puntuacion_empresa) : null,
        notas_privadas: formData.notas_privadas,
        tags: formData.tags
      });
      
      if (response.data.success) {
        toast.success('Cambios guardados correctamente');
        onUpdate && onUpdate();
        onHide();
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const getEstadoColor = (estado) => {
    const estadoObj = estadosDisponibles.find(e => e.value === estado);
    return estadoObj ? estadoObj.color : 'secondary';
  };

  if (!show || !candidato) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pencil-square me-2"></i>
              Edición Rápida - {candidato.candidato?.user?.name || 
                               `${candidato.candidato?.nombre || ''} ${candidato.candidato?.apellido || ''}`.trim()}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Estado y Evaluación</h6>
                    
                    <div className="mb-3">
                      <label className="form-label">Estado Interno</label>
                      <select 
                        className="form-select"
                        value={formData.estado_interno}
                        onChange={(e) => handleInputChange('estado_interno', e.target.value)}
                      >
                        {estadosDisponibles.map(estado => (
                          <option key={estado.value} value={estado.value}>
                            {estado.label}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1">
                        <small className="text-muted">Estado actual: </small>
                        <span className={`badge bg-${getEstadoColor(candidato.estado_interno)}`}>
                          {candidato.estado_interno?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Puntuación Empresa (0-10)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.puntuacion_empresa}
                        onChange={(e) => handleInputChange('puntuacion_empresa', e.target.value)}
                        placeholder="Ej: 8.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Tags</h6>
                    
                    <div className="mb-3">
                      <div className="mb-2">
                        {formData.tags.map((tag, index) => (
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
                          type="button"
                          onClick={agregarTag}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                      <small className="text-muted">
                        Presiona Enter o clic en + para agregar
                      </small>
                    </div>
                  </div>
                </div>

                <div className="card mt-3">
                  <div className="card-body">
                    <h6 className="card-title">Información Básica</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{candidato.candidato?.email}</td>
                        </tr>
                        <tr>
                          <td><strong>Teléfono:</strong></td>
                          <td>{candidato.candidato?.telefono || 'No registrado'}</td>
                        </tr>
                        <tr>
                          <td><strong>Origen:</strong></td>
                          <td>
                            <span className="badge bg-light text-dark">{candidato.origen}</span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Incorporado:</strong></td>
                          <td>
                            {candidato.fecha_incorporacion ? 
                             new Date(candidato.fecha_incorporacion).toLocaleDateString('es-ES') : 
                             'No registrada'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Notas Privadas</h6>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Agregar notas internas sobre este candidato..."
                      value={formData.notas_privadas}
                      onChange={(e) => handleInputChange('notas_privadas', e.target.value)}
                    ></textarea>
                    <small className="text-muted">
                      Estas notas son privadas y solo las verá tu empresa
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de cambios */}
            {(formData.estado_interno !== candidato.estado_interno ||
              formData.puntuacion_empresa !== (candidato.puntuacion_empresa || '') ||
              formData.notas_privadas !== (candidato.notas_privadas || '') ||
              JSON.stringify(formData.tags) !== JSON.stringify(candidato.tags || [])) && (
              <div className="alert alert-info mt-3">
                <h6><i className="bi bi-info-circle me-1"></i>Cambios pendientes:</h6>
                <ul className="mb-0">
                  {formData.estado_interno !== candidato.estado_interno && (
                    <li>
                      Estado: <strong>{candidato.estado_interno || 'Sin estado'}</strong> → 
                      <strong className="ms-1">{formData.estado_interno}</strong>
                    </li>
                  )}
                  {formData.puntuacion_empresa !== (candidato.puntuacion_empresa || '') && (
                    <li>
                      Puntuación: <strong>{candidato.puntuacion_empresa || 'Sin puntuación'}</strong> → 
                      <strong className="ms-1">{formData.puntuacion_empresa || 'Sin puntuación'}</strong>
                    </li>
                  )}
                  {formData.notas_privadas !== (candidato.notas_privadas || '') && (
                    <li>Notas privadas actualizadas</li>
                  )}
                  {JSON.stringify(formData.tags) !== JSON.stringify(candidato.tags || []) && (
                    <li>Tags modificados</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancelar
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
