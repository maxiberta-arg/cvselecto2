import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EditarBusquedaLaboral() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [empresaData, setEmpresaData] = useState(null);
  const [busquedaOriginal, setBusquedaOriginal] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    estado: 'abierta',
    fecha_publicacion: '',
    fecha_cierre: ''
  });

  // Cargar datos de la búsqueda y empresa
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || !id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos de la empresa
        const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
        const empresa = empresaResponse.data;
        setEmpresaData(empresa);
        
        // Cargar datos de la búsqueda específica
        const busquedaResponse = await api.get(`/busquedas-laborales/${id}`);
        const busqueda = busquedaResponse.data;
        
        // Verificar que la búsqueda pertenece a la empresa del usuario
        if (parseInt(busqueda.empresa_id) !== parseInt(empresa.id)) {
          throw new Error('No tienes permisos para editar esta búsqueda laboral');
        }
        
        setBusquedaOriginal(busqueda);
        
        // Cargar datos en el formulario
        setFormData({
          titulo: busqueda.titulo || '',
          descripcion: busqueda.descripcion || '',
          requisitos: busqueda.requisitos || '',
          estado: busqueda.estado || 'abierta',
          fecha_publicacion: busqueda.fecha_publicacion ? busqueda.fecha_publicacion.split('T')[0] : '',
          fecha_cierre: busqueda.fecha_cierre ? busqueda.fecha_cierre.split('T')[0] : ''
        });
        
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        if (err.response?.status === 404) {
          setError('No se encontró la búsqueda laboral solicitada.');
          setTimeout(() => navigate('/mis-busquedas-laborales'), 3000);
        } else if (err.response?.status === 403 || err.message.includes('permisos')) {
          setError('No tienes permisos para editar esta búsqueda laboral.');
          setTimeout(() => navigate('/mis-busquedas-laborales'), 3000);
        } else {
          setError(`Error al cargar los datos: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, id, navigate]);

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Marcar campo como tocado
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    // Limpiar error específico del campo si existía
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Limpiar mensajes generales
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Validación del formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es obligatorio';
    } else if (formData.titulo.length < 5) {
      errors.titulo = 'El título debe tener al menos 5 caracteres';
    } else if (formData.titulo.length > 255) {
      errors.titulo = 'El título no puede exceder 255 caracteres';
    }

    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 20) {
      errors.descripcion = 'La descripción debe tener al menos 20 caracteres';
    }

    if (formData.requisitos && formData.requisitos.length > 2000) {
      errors.requisitos = 'Los requisitos no pueden exceder 2000 caracteres';
    }

    if (formData.fecha_cierre) {
      const fechaCierre = new Date(formData.fecha_cierre);
      const fechaPublicacion = new Date(formData.fecha_publicacion);
      
      if (fechaCierre <= fechaPublicacion) {
        errors.fecha_cierre = 'La fecha de cierre debe ser posterior a la fecha de publicación';
      }
    }

    return errors;
  };

  // Función para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const response = await api.put(`/busquedas-laborales/${id}`, formData);
      
      setSuccess('¡Búsqueda laboral actualizada exitosamente!');
      setBusquedaOriginal(response.data);
      
      // Redirect después del éxito
      setTimeout(() => {
        navigate('/mis-busquedas-laborales');
      }, 2000);

    } catch (err) {
      console.error('❌ Error al actualizar búsqueda:', err);
      
      if (err.response?.status === 422) {
        // Errores de validación del backend
        const backendErrors = err.response.data.errors || {};
        setFieldErrors(backendErrors);
        setError('Por favor corrige los errores de validación');
      } else if (err.response?.status === 401) {
        setError('No tienes autorización para realizar esta acción');
      } else if (err.response?.status === 404) {
        setError('No se encontró la búsqueda laboral');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para editar esta búsqueda');
      } else {
        setError(err.response?.data?.message || 'Error al actualizar la búsqueda laboral');
      }
    } finally {
      setSaving(false);
    }
  };

  // Función para cancelar y volver
  const handleCancel = () => {
    navigate('/mis-busquedas-laborales');
  };

  // Función para detectar cambios en el formulario
  const hasChanges = () => {
    if (!busquedaOriginal) return false;
    
    return (
      formData.titulo !== (busquedaOriginal.titulo || '') ||
      formData.descripcion !== (busquedaOriginal.descripcion || '') ||
      formData.requisitos !== (busquedaOriginal.requisitos || '') ||
      formData.estado !== (busquedaOriginal.estado || 'abierta') ||
      formData.fecha_publicacion !== (busquedaOriginal.fecha_publicacion ? busquedaOriginal.fecha_publicacion.split('T')[0] : '') ||
      formData.fecha_cierre !== (busquedaOriginal.fecha_cierre ? busquedaOriginal.fecha_cierre.split('T')[0] : '')
    );
  };

  // Función para obtener la clase CSS del campo según su estado
  const getFieldClass = (fieldName) => {
    const hasError = fieldErrors[fieldName];
    const wasTouched = touchedFields[fieldName];
    
    let baseClass = 'form-control';
    
    if (wasTouched) {
      if (hasError) {
        baseClass += ' is-invalid';
      } else {
        baseClass += ' is-valid';
      }
    }
    
    return baseClass;
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierta': return 'success';
      case 'pausada': return 'warning';
      case 'cerrada': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                <div className="card-body text-center p-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <h5>Cargando datos de la búsqueda laboral...</h5>
                  <p className="text-muted">Verificando permisos y cargando información...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10">
            
            {/* Header */}
            <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #7b1fa2 60%, #ab47bc 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)' }}>
                    <i className="bi bi-pencil-square text-white" style={{ fontSize: '1.8rem' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="fw-bold text-white mb-1">Editar Búsqueda Laboral</h3>
                    <p className="text-white-50 mb-0">
                      {empresaData && busquedaOriginal && (
                        <>
                          {empresaData.razon_social} • {busquedaOriginal.titulo} • 
                          <span className={`badge bg-${getEstadoColor(busquedaOriginal.estado)} ms-1`}>
                            {busquedaOriginal.estado}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    {hasChanges() && (
                      <span className="badge bg-warning text-dark px-3 py-2">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Cambios sin guardar
                      </span>
                    )}
                    <button 
                      className="btn btn-light btn-sm"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Volver
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes de estado */}
            {error && (
              <div className="alert alert-danger shadow-sm mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success shadow-sm mb-4" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {success}
              </div>
            )}

            {/* Formulario de edición */}
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5">
                <form onSubmit={handleSubmit} noValidate>
                  
                  {/* Información básica */}
                  <div className="mb-5">
                    <h5 className="fw-bold mb-3 text-primary">
                      <i className="bi bi-info-circle me-2"></i>
                      Información Básica
                    </h5>
                    
                    <div className="row">
                      <div className="col-12 mb-4">
                        <label htmlFor="titulo" className="form-label fw-semibold">
                          Título del Puesto *
                          <span className="text-muted ms-1">(Ej: Desarrollador Frontend, Contador Senior)</span>
                        </label>
                        <input
                          type="text"
                          id="titulo"
                          name="titulo"
                          className={getFieldClass('titulo')}
                          value={formData.titulo}
                          onChange={handleInputChange}
                          placeholder="Ej: Desarrollador Full Stack React/Laravel"
                          maxLength="255"
                          disabled={saving}
                        />
                        {fieldErrors.titulo && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.titulo}
                          </div>
                        )}
                        <div className="form-text">
                          {formData.titulo.length}/255 caracteres
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12 mb-4">
                        <label htmlFor="descripcion" className="form-label fw-semibold">
                          Descripción del Puesto *
                          <span className="text-muted ms-1">(Detalla las responsabilidades y el perfil buscado)</span>
                        </label>
                        <textarea
                          id="descripcion"
                          name="descripcion"
                          className={getFieldClass('descripcion')}
                          value={formData.descripcion}
                          onChange={handleInputChange}
                          placeholder="Describe las principales responsabilidades del puesto, el ambiente de trabajo, oportunidades de crecimiento..."
                          rows="6"
                          disabled={saving}
                        />
                        {fieldErrors.descripcion && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.descripcion}
                          </div>
                        )}
                        <div className="form-text">
                          Mínimo 20 caracteres. Actual: {formData.descripcion.length}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12 mb-4">
                        <label htmlFor="requisitos" className="form-label fw-semibold">
                          Requisitos y Competencias
                          <span className="text-muted ms-1">(Experiencia, habilidades técnicas, idiomas, etc.)</span>
                        </label>
                        <textarea
                          id="requisitos"
                          name="requisitos"
                          className={getFieldClass('requisitos')}
                          value={formData.requisitos}
                          onChange={handleInputChange}
                          placeholder="• Experiencia mínima de 2 años en desarrollo web&#10;• Conocimientos en React, Laravel, MySQL&#10;• Inglés intermedio&#10;• Capacidad de trabajo en equipo"
                          rows="5"
                          maxLength="2000"
                          disabled={saving}
                        />
                        {fieldErrors.requisitos && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.requisitos}
                          </div>
                        )}
                        <div className="form-text">
                          {formData.requisitos.length}/2000 caracteres
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuración de publicación */}
                  <div className="mb-5">
                    <h5 className="fw-bold mb-3 text-success">
                      <i className="bi bi-calendar-event me-2"></i>
                      Configuración de Publicación
                    </h5>
                    
                    <div className="row">
                      <div className="col-md-4 mb-4">
                        <label htmlFor="estado" className="form-label fw-semibold">
                          Estado de la Búsqueda
                        </label>
                        <select
                          id="estado"
                          name="estado"
                          className={getFieldClass('estado')}
                          value={formData.estado}
                          onChange={handleInputChange}
                          disabled={saving}
                        >
                          <option value="abierta">🟢 Abierta</option>
                          <option value="pausada">🟡 Pausada</option>
                          <option value="cerrada">🔴 Cerrada</option>
                        </select>
                        {fieldErrors.estado && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.estado}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 mb-4">
                        <label htmlFor="fecha_publicacion" className="form-label fw-semibold">
                          Fecha de Publicación
                        </label>
                        <input
                          type="date"
                          id="fecha_publicacion"
                          name="fecha_publicacion"
                          className={getFieldClass('fecha_publicacion')}
                          value={formData.fecha_publicacion}
                          onChange={handleInputChange}
                          disabled={saving}
                        />
                        {fieldErrors.fecha_publicacion && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.fecha_publicacion}
                          </div>
                        )}
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          Fecha en que se publicó originalmente
                        </div>
                      </div>

                      <div className="col-md-4 mb-4">
                        <label htmlFor="fecha_cierre" className="form-label fw-semibold">
                          Fecha de Cierre
                          <span className="text-muted ms-1">(Opcional)</span>
                        </label>
                        <input
                          type="date"
                          id="fecha_cierre"
                          name="fecha_cierre"
                          className={getFieldClass('fecha_cierre')}
                          value={formData.fecha_cierre}
                          onChange={handleInputChange}
                          min={formData.fecha_publicacion}
                          disabled={saving}
                        />
                        {fieldErrors.fecha_cierre && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.fecha_cierre}
                          </div>
                        )}
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          Fecha límite para recibir postulaciones
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="d-flex justify-content-between align-items-center pt-4 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg px-4"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Cancelar
                    </button>
                    
                    <div className="d-flex gap-2">
                      {hasChanges() && (
                        <span className="text-warning small me-3 align-self-center">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Tienes cambios sin guardar
                        </span>
                      )}
                      
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg px-5"
                        disabled={saving || !hasChanges()}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-2"></i>
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            </div>

            {/* Footer con información de historial */}
            {busquedaOriginal && (
              <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '15px', background: '#f8f9fa' }}>
                <div className="card-body p-4">
                  <div className="row text-center">
                    <div className="col-md-3">
                      <div className="mb-2">
                        <i className="bi bi-calendar-plus text-primary" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <h6 className="fw-semibold">Creada</h6>
                      <small className="text-muted">
                        {busquedaOriginal.created_at ? new Date(busquedaOriginal.created_at).toLocaleDateString('es-AR') : 'No disponible'}
                      </small>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-2">
                        <i className="bi bi-pencil text-success" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <h6 className="fw-semibold">Última edición</h6>
                      <small className="text-muted">
                        {busquedaOriginal.updated_at ? new Date(busquedaOriginal.updated_at).toLocaleDateString('es-AR') : 'Nunca'}
                      </small>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-2">
                        <i className="bi bi-people text-warning" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <h6 className="fw-semibold">Postulaciones</h6>
                      <small className="text-muted">
                        {busquedaOriginal.postulaciones?.length || 0} candidatos
                      </small>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-2">
                        <i className="bi bi-eye text-info" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <h6 className="fw-semibold">Estado actual</h6>
                      <small className={`badge bg-${getEstadoColor(busquedaOriginal.estado)} text-white`}>
                        {busquedaOriginal.estado}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
