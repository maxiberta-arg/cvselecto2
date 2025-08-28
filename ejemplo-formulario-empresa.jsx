import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configurar axios con la base URL del backend Laravel
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const FormularioEmpresa = ({ empresaId }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    razon_social: '',
    cuit: '',
    telefono: '',
    direccion: '',
    descripcion: '',
    sector: '',
    tamaño_empresa: '',
    año_fundacion: '',
    email_contacto: '',
    persona_contacto: '',
    sitio_web: '',
    linkedin_url: '',
    logo: null,
    // Datos de usuario
    user_name: '',
    user_email: '',
    password: '',
    password_confirmation: ''
  });

  // Estado para el control del formulario
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Estado para mensajes
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    if (empresaId) {
      loadEmpresaData();
    }
  }, [empresaId]);

  const loadEmpresaData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/empresas/${empresaId}`);
      
      if (response.data) {
        const empresa = response.data;
        setFormData({
          razon_social: empresa.razon_social || '',
          cuit: empresa.cuit || '',
          telefono: empresa.telefono || '',
          direccion: empresa.direccion || '',
          descripcion: empresa.descripcion || '',
          sector: empresa.sector || '',
          tamaño_empresa: empresa.tamaño_empresa || '',
          año_fundacion: empresa.año_fundacion || '',
          email_contacto: empresa.email_contacto || '',
          persona_contacto: empresa.persona_contacto || '',
          sitio_web: empresa.sitio_web || '',
          linkedin_url: empresa.linkedin_url || '',
          logo: null,
          // Datos de usuario
          user_name: empresa.user?.name || '',
          user_email: empresa.user?.email || '',
          password: '',
          password_confirmation: ''
        });
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos de la empresa');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpiar errores del campo cuando el usuario empiece a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar campos obligatorios
  const validateForm = () => {
    const errors = {};

    // Validar razón social (obligatorio)
    if (!formData.razon_social || formData.razon_social.trim().length < 3) {
      errors.razon_social = 'La razón social es obligatoria y debe tener al menos 3 caracteres';
    }

    // Validar CUIT (obligatorio)
    if (!formData.cuit || formData.cuit.trim().length === 0) {
      errors.cuit = 'El CUIT es obligatorio';
    }

    // Validar email de usuario
    if (formData.user_email && !/\S+@\S+\.\S+/.test(formData.user_email)) {
      errors.user_email = 'El email no tiene un formato válido';
    }

    // Validar contraseña si se está cambiando
    if (formData.password) {
      if (formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'La confirmación de contraseña no coincide';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes anteriores
    setError(null);
    setSuccess(null);
    
    // Validar formulario
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario antes de continuar');
      return;
    }
    
    setSaving(true);
    
    try {
      // Crear FormData para envío multipart (necesario para archivos)
      const formDataToSend = new FormData();
      
      // Datos básicos de la empresa
      formDataToSend.append('razon_social', formData.razon_social);
      formDataToSend.append('cuit', formData.cuit.replace(/\s/g, '')); // Remover espacios
      
      // Datos opcionales de empresa
      if (formData.telefono) formDataToSend.append('telefono', formData.telefono);
      if (formData.direccion) formDataToSend.append('direccion', formData.direccion);
      if (formData.descripcion) formDataToSend.append('descripcion', formData.descripcion);
      if (formData.sector) formDataToSend.append('sector', formData.sector);
      if (formData.tamaño_empresa) formDataToSend.append('tamaño_empresa', formData.tamaño_empresa);
      if (formData.año_fundacion) formDataToSend.append('año_fundacion', formData.año_fundacion);
      if (formData.email_contacto) formDataToSend.append('email_contacto', formData.email_contacto);
      if (formData.persona_contacto) formDataToSend.append('persona_contacto', formData.persona_contacto);
      if (formData.sitio_web) formDataToSend.append('sitio_web', formData.sitio_web);
      if (formData.linkedin_url) formDataToSend.append('linkedin_url', formData.linkedin_url);
      
      // Datos de usuario
      if (formData.user_name) formDataToSend.append('user_name', formData.user_name);
      if (formData.user_email) formDataToSend.append('user_email', formData.user_email);
      if (formData.password) {
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password_confirmation);
      }
      
      // Archivo de logo
      if (formData.logo && formData.logo instanceof File) {
        formDataToSend.append('logo', formData.logo);
      }

      console.log('Enviando datos:', Object.fromEntries(formDataToSend.entries()));
      
      // Realizar petición PUT usando _method para Laravel
      const response = await api.post(`/empresas/${empresaId}?_method=PUT`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setSuccess('✅ Empresa actualizada correctamente');
        setEditMode(false);
        
        // Recargar datos actualizados
        await loadEmpresaData();
        
        // Auto-ocultar mensaje después de 5 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
        
      } else {
        setError('Error al actualizar la empresa. Inténtelo nuevamente.');
      }
      
    } catch (err) {
      console.error('Error al guardar:', err);
      
      if (err.response?.status === 422) {
        // Errores de validación del backend
        const validationErrors = err.response.data.errors || {};
        const newErrors = {};
        
        // Mapear errores del backend a campos del frontend
        Object.keys(validationErrors).forEach(key => {
          if (validationErrors[key] && validationErrors[key].length > 0) {
            newErrors[key] = validationErrors[key][0];
          }
        });
        
        setFieldErrors(newErrors);
        setError('Por favor corrige los errores marcados en el formulario');
      } else if (err.response?.status === 404) {
        setError('No se encontró la empresa. Contacte al administrador.');
      } else if (err.response?.status === 403) {
        setError('No tiene permisos para realizar esta acción.');
      } else if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else {
        setError('Error al guardar los cambios. Verifique su conexión e inténtelo nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Función para mostrar clases de validación
  const getFieldClasses = (fieldName) => {
    const baseClasses = 'form-control';
    if (!editMode) return baseClasses;
    
    if (fieldErrors[fieldName]) {
      return `${baseClasses} is-invalid`;
    }
    
    return baseClasses;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Perfil de Empresa</h5>
          {!editMode ? (
            <button 
              className="btn btn-primary"
              onClick={() => setEditMode(true)}
            >
              <i className="fas fa-edit me-2"></i>
              Editar
            </button>
          ) : (
            <div>
              <button 
                className="btn btn-success me-2"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Guardar
                  </>
                )}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEditMode(false);
                  setFieldErrors({});
                  setError(null);
                  loadEmpresaData();
                }}
                disabled={saving}
              >
                <i className="fas fa-times me-2"></i>
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="card-body">
          {/* Mensajes de estado */}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccess(null)}
              ></button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Razón Social - Campo principal */}
              <div className="col-md-6 mb-3">
                <label htmlFor="razon_social" className="form-label">
                  Razón Social <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={getFieldClasses('razon_social')}
                  id="razon_social"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="Ingrese la razón social de la empresa"
                />
                {fieldErrors.razon_social && (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.razon_social}
                  </div>
                )}
              </div>

              {/* CUIT */}
              <div className="col-md-6 mb-3">
                <label htmlFor="cuit" className="form-label">
                  CUIT <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={getFieldClasses('cuit')}
                  id="cuit"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="XX-XXXXXXXX-X"
                />
                {fieldErrors.cuit && (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.cuit}
                  </div>
                )}
              </div>

              {/* Teléfono */}
              <div className="col-md-6 mb-3">
                <label htmlFor="telefono" className="form-label">Teléfono</label>
                <input
                  type="text"
                  className={getFieldClasses('telefono')}
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="+54 11 xxxx-xxxx"
                />
                {fieldErrors.telefono && (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.telefono}
                  </div>
                )}
              </div>

              {/* Email de contacto */}
              <div className="col-md-6 mb-3">
                <label htmlFor="email_contacto" className="form-label">Email de Contacto</label>
                <input
                  type="email"
                  className={getFieldClasses('email_contacto')}
                  id="email_contacto"
                  name="email_contacto"
                  value={formData.email_contacto}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  placeholder="contacto@empresa.com"
                />
                {fieldErrors.email_contacto && (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.email_contacto}
                  </div>
                )}
              </div>

              {/* Dirección */}
              <div className="col-12 mb-3">
                <label htmlFor="direccion" className="form-label">Dirección</label>
                <textarea
                  className={getFieldClasses('direccion')}
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  rows="2"
                  placeholder="Ingrese la dirección completa"
                />
                {fieldErrors.direccion && (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.direccion}
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="col-12 mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea
                  className={getFieldClasses('descripcion')}
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  rows="4"
                  placeholder="Describa la actividad de la empresa (mínimo 50 caracteres)"
                />
                {fieldErrors.descripcion && (
                  <div className="invalid-feedback d-block">
                    {fieldErrors.descripcion}
                  </div>
                )}
              </div>

              {/* Logo */}
              {editMode && (
                <div className="col-md-6 mb-3">
                  <label htmlFor="logo" className="form-label">Logo de la Empresa</label>
                  <input
                    type="file"
                    className={getFieldClasses('logo')}
                    id="logo"
                    name="logo"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                  <div className="form-text">Formatos: JPG, PNG, GIF. Tamaño máximo: 2MB</div>
                  {fieldErrors.logo && (
                    <div className="invalid-feedback d-block">
                      {fieldErrors.logo}
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioEmpresa;
