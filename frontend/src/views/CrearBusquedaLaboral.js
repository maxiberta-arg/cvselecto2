import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CrearBusquedaLaboral() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [empresaData, setEmpresaData] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    beneficios: '',
    salario_min: '',
    salario_max: '',
    moneda: 'ARS',
    modalidad: '',
    ubicacion: '',
    experiencia_requerida: '',
    nivel_educativo: '',
    idiomas: '',
    tipo_contrato: '',
    jornada_laboral: '',
    estado: 'abierta',
    fecha_publicacion: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    fecha_cierre: ''
  });

  // Cargar datos de la empresa al montar
  useEffect(() => {
    const loadEmpresaData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/empresas/by-user/${user.id}`);
        setEmpresaData(response.data);
        
      } catch (err) {
        console.error('Error al cargar empresa:', err);
        if (err.response?.status === 404) {
          setError('No se encontró el perfil de empresa. Complete su perfil primero.');
          setTimeout(() => navigate('/configuracion-empresa'), 3000);
        } else {
          setError('Error al cargar los datos de la empresa');
        }
      } finally {
        setLoading(false);
      }
    };

    loadEmpresaData();
  }, [user?.id, navigate]);

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

    // Validación de salarios
    if (formData.salario_min && formData.salario_max) {
      const salarioMin = parseFloat(formData.salario_min);
      const salarioMax = parseFloat(formData.salario_max);
      
      if (salarioMin <= 0) {
        errors.salario_min = 'El salario mínimo debe ser mayor a 0';
      }
      
      if (salarioMax <= 0) {
        errors.salario_max = 'El salario máximo debe ser mayor a 0';
      }
      
      if (salarioMin >= salarioMax) {
        errors.salario_max = 'El salario máximo debe ser mayor al mínimo';
      }
    }

    // Validación de experiencia
    if (formData.experiencia_requerida) {
      const exp = parseInt(formData.experiencia_requerida);
      if (exp < 0 || exp > 50) {
        errors.experiencia_requerida = 'La experiencia debe estar entre 0 y 50 años';
      }
    }

    if (formData.fecha_cierre) {
      const fechaCierre = new Date(formData.fecha_cierre);
      const fechaPublicacion = new Date(formData.fecha_publicacion);
      
      if (fechaCierre <= fechaPublicacion) {
        errors.fecha_cierre = 'La fecha de cierre debe ser posterior a la fecha de publicación';
      }

      if (fechaPublicacion < new Date().setHours(0, 0, 0, 0)) {
        errors.fecha_publicacion = 'La fecha de publicación no puede ser anterior a hoy';
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

    if (!empresaData?.id) {
      setError('Error: No se pudo identificar la empresa');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const payload = {
        ...formData,
        empresa_id: empresaData.id
      };

      const response = await api.post('/busquedas-laborales', payload);
      
      setSuccess('¡Búsqueda laboral creada exitosamente!');
      
      // Redirect after success
      setTimeout(() => {
        navigate('/mis-busquedas');
      }, 2000);

    } catch (err) {
      console.error('Error al crear búsqueda laboral:', err);
      
      if (err.response?.status === 422) {
        // Errores de validación del backend
        const backendErrors = err.response.data.errors || {};
        setFieldErrors(backendErrors);
        setError('Por favor corrige los errores de validación');
      } else if (err.response?.status === 401) {
        setError('No tienes autorización para realizar esta acción');
      } else if (err.response?.status === 404) {
        setError('No se encontró la empresa asociada');
      } else {
        setError(err.response?.data?.message || 'Error al crear la búsqueda laboral');
      }
    } finally {
      setSaving(false);
    }
  };

  // Función para cancelar y volver
  const handleCancel = () => {
    navigate('/empresa-dashboard');
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
                  <h5>Cargando datos de la empresa...</h5>
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
            <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #fbc02d 60%, #ffe082 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)' }}>
                    <i className="bi bi-clipboard-plus text-white" style={{ fontSize: '1.8rem' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="fw-bold text-white mb-1">Crear Nueva Búsqueda Laboral</h3>
                    <p className="text-white-50 mb-0">
                      {empresaData && `${empresaData.razon_social || 'Tu empresa'} • ${empresaData.sector || 'Sector empresarial'}`}
                    </p>
                  </div>
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

            {/* Formulario principal */}
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

                    <div className="row">
                      <div className="col-12 mb-4">
                        <label htmlFor="beneficios" className="form-label fw-semibold">
                          Beneficios y Compensaciones
                          <span className="text-muted ms-1">(Opcional - Describe qué ofreces además del salario)</span>
                        </label>
                        <textarea
                          id="beneficios"
                          name="beneficios"
                          className={getFieldClass('beneficios')}
                          value={formData.beneficios}
                          onChange={handleInputChange}
                          placeholder="• Obra social premium&#10;• Capacitaciones pagadas&#10;• Flexibilidad horaria&#10;• Home office&#10;• Bonos por objetivos"
                          rows="4"
                          maxLength="2000"
                          disabled={saving}
                        />
                        {fieldErrors.beneficios && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.beneficios}
                          </div>
                        )}
                        <div className="form-text">
                          {formData.beneficios.length}/2000 caracteres
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Condiciones de trabajo */}
                  <div className="mb-5">
                    <h5 className="fw-bold mb-3 text-info">
                      <i className="bi bi-briefcase me-2"></i>
                      Condiciones de Trabajo
                    </h5>
                    
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label htmlFor="salario_min" className="form-label fw-semibold">
                          Salario Mínimo
                          <span className="text-muted ms-1">(Opcional)</span>
                        </label>
                        <div className="input-group">
                          <select
                            name="moneda"
                            className="form-select"
                            style={{ maxWidth: '100px' }}
                            value={formData.moneda}
                            onChange={handleInputChange}
                            disabled={saving}
                          >
                            <option value="ARS">ARS $</option>
                            <option value="USD">USD $</option>
                            <option value="EUR">EUR €</option>
                          </select>
                          <input
                            type="number"
                            id="salario_min"
                            name="salario_min"
                            className={getFieldClass('salario_min')}
                            value={formData.salario_min}
                            onChange={handleInputChange}
                            placeholder="250000"
                            min="0"
                            step="1000"
                            disabled={saving}
                          />
                        </div>
                        {fieldErrors.salario_min && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.salario_min}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-4">
                        <label htmlFor="salario_max" className="form-label fw-semibold">
                          Salario Máximo
                          <span className="text-muted ms-1">(Opcional)</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">{formData.moneda === 'ARS' ? '$' : formData.moneda === 'USD' ? '$' : '€'}</span>
                          <input
                            type="number"
                            id="salario_max"
                            name="salario_max"
                            className={getFieldClass('salario_max')}
                            value={formData.salario_max}
                            onChange={handleInputChange}
                            placeholder="350000"
                            min="0"
                            step="1000"
                            disabled={saving}
                          />
                        </div>
                        {fieldErrors.salario_max && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.salario_max}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-4">
                        <label htmlFor="modalidad" className="form-label fw-semibold">
                          Modalidad de Trabajo
                        </label>
                        <select
                          id="modalidad"
                          name="modalidad"
                          className={getFieldClass('modalidad')}
                          value={formData.modalidad}
                          onChange={handleInputChange}
                          disabled={saving}
                        >
                          <option value="">Seleccionar modalidad</option>
                          <option value="presencial">🏢 Presencial</option>
                          <option value="remoto">🏠 Remoto</option>
                          <option value="hibrido">🔄 Híbrido</option>
                        </select>
                        {fieldErrors.modalidad && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.modalidad}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 mb-4">
                        <label htmlFor="tipo_contrato" className="form-label fw-semibold">
                          Tipo de Contrato
                        </label>
                        <select
                          id="tipo_contrato"
                          name="tipo_contrato"
                          className={getFieldClass('tipo_contrato')}
                          value={formData.tipo_contrato}
                          onChange={handleInputChange}
                          disabled={saving}
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="indefinido">Indefinido</option>
                          <option value="temporal">Temporal</option>
                          <option value="por_proyecto">Por Proyecto</option>
                          <option value="freelance">Freelance</option>
                          <option value="pasantia">Pasantía</option>
                        </select>
                        {fieldErrors.tipo_contrato && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.tipo_contrato}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 mb-4">
                        <label htmlFor="jornada_laboral" className="form-label fw-semibold">
                          Jornada Laboral
                        </label>
                        <select
                          id="jornada_laboral"
                          name="jornada_laboral"
                          className={getFieldClass('jornada_laboral')}
                          value={formData.jornada_laboral}
                          onChange={handleInputChange}
                          disabled={saving}
                        >
                          <option value="">Seleccionar jornada</option>
                          <option value="completa">Tiempo Completo</option>
                          <option value="media">Medio Tiempo</option>
                          <option value="por_horas">Por Horas</option>
                          <option value="flexible">Flexible</option>
                        </select>
                        {fieldErrors.jornada_laboral && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.jornada_laboral}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-8 mb-4">
                        <label htmlFor="ubicacion" className="form-label fw-semibold">
                          Ubicación
                          <span className="text-muted ms-1">(Ciudad, Provincia - Requerido si es presencial)</span>
                        </label>
                        <input
                          type="text"
                          id="ubicacion"
                          name="ubicacion"
                          className={getFieldClass('ubicacion')}
                          value={formData.ubicacion}
                          onChange={handleInputChange}
                          placeholder="Ej: Buenos Aires, CABA"
                          maxLength="255"
                          disabled={saving}
                        />
                        {fieldErrors.ubicacion && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.ubicacion}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 mb-4">
                        <label htmlFor="experiencia_requerida" className="form-label fw-semibold">
                          Años de Experiencia
                          <span className="text-muted ms-1">(Mínimo)</span>
                        </label>
                        <input
                          type="number"
                          id="experiencia_requerida"
                          name="experiencia_requerida"
                          className={getFieldClass('experiencia_requerida')}
                          value={formData.experiencia_requerida}
                          onChange={handleInputChange}
                          placeholder="2"
                          min="0"
                          max="50"
                          disabled={saving}
                        />
                        {fieldErrors.experiencia_requerida && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.experiencia_requerida}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label htmlFor="nivel_educativo" className="form-label fw-semibold">
                          Nivel Educativo Requerido
                        </label>
                        <select
                          id="nivel_educativo"
                          name="nivel_educativo"
                          className={getFieldClass('nivel_educativo')}
                          value={formData.nivel_educativo}
                          onChange={handleInputChange}
                          disabled={saving}
                        >
                          <option value="">Seleccionar nivel</option>
                          <option value="sin_estudios">Sin estudios formales</option>
                          <option value="primario">Primario</option>
                          <option value="secundario">Secundario</option>
                          <option value="terciario">Terciario</option>
                          <option value="universitario">Universitario</option>
                          <option value="posgrado">Posgrado</option>
                        </select>
                        {fieldErrors.nivel_educativo && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.nivel_educativo}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-4">
                        <label htmlFor="idiomas" className="form-label fw-semibold">
                          Idiomas Requeridos
                          <span className="text-muted ms-1">(Opcional)</span>
                        </label>
                        <textarea
                          id="idiomas"
                          name="idiomas"
                          className={getFieldClass('idiomas')}
                          value={formData.idiomas}
                          onChange={handleInputChange}
                          placeholder="Ej: Español nativo, Inglés intermedio/avanzado, Portugués básico"
                          rows="3"
                          maxLength="500"
                          disabled={saving}
                        />
                        {fieldErrors.idiomas && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {fieldErrors.idiomas}
                          </div>
                        )}
                        <div className="form-text">
                          {formData.idiomas.length}/500 caracteres
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
                          min={new Date().toISOString().split('T')[0]}
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
                          La búsqueda se publicará en esta fecha
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
                    
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-5"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Crear Búsqueda Laboral
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </div>

            {/* Footer con información adicional */}
            <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '15px', background: '#f8f9fa' }}>
              <div className="card-body p-4">
                <div className="row text-center">
                  <div className="col-md-4">
                    <div className="mb-2">
                      <i className="bi bi-eye text-primary" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h6 className="fw-semibold">Visibilidad</h6>
                    <small className="text-muted">Tu búsqueda será visible para todos los candidatos registrados</small>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-2">
                      <i className="bi bi-people text-success" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h6 className="fw-semibold">Candidatos</h6>
                    <small className="text-muted">Podrás recibir postulaciones automáticas y agregar candidatos manualmente</small>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-2">
                      <i className="bi bi-graph-up text-warning" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <h6 className="fw-semibold">Gestión</h6>
                    <small className="text-muted">Podrás editar, pausar o cerrar la búsqueda en cualquier momento</small>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
