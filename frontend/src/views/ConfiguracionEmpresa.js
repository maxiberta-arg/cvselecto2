import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ConfiguracionEmpresa() {
  const { user, updateUserInfo } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('cuenta');
  const [empresaId, setEmpresaId] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [previewLogo, setPreviewLogo] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [logoToDelete, setLogoToDelete] = useState(false);

  const [formData, setFormData] = useState({
    // Datos del usuario
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    
    // Datos de la empresa
    razon_social: '',
    cuit: '',
    telefono: '',
    direccion: '',
    descripcion: '',
    sitio_web: '',
    linkedin_url: '',
    sector: '',
    empleados_cantidad: '',
    logo: null,
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    cargarConfiguracion();
  }, [user?.id]);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      setError(null);
      
        const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
        const empresa = empresaResponse.data;
        
        // Debug: Log para verificar el logo recibido
        console.log('Logo recibido del backend:', empresa.logo_path);
        
        setEmpresaId(empresa.id);      const initialData = {
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        
        razon_social: empresa.razon_social || '',
        cuit: empresa.cuit || '',
        telefono: empresa.telefono || '',
        direccion: empresa.direccion || '',
        descripcion: empresa.descripcion || '',
        sector: empresa.sector || '',
        empleados_cantidad: empresa.tamaño_empresa || '',
        sitio_web: empresa.sitio_web || '',
        linkedin_url: empresa.linkedin_url || '',
        logo: empresa.logo_path || null, // Cambiado de logo a logo_path
      };

      setFormData(initialData);
      setOriginalData({ ...initialData });
      
      // Establecer preview del logo actual si existe
      if (empresa.logo_path) {
        // Agregar timestamp para evitar caché del navegador
        const logoUrl = empresa.logo_path + '?t=' + new Date().getTime();
        setPreviewLogo(logoUrl);
      }
      
    } catch (err) {
      console.error('Error al cargar configuración:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  // Función de validación individual
  const validateField = (name, value) => {
    let error = '';
    
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    switch (name) {
      case 'name':
        if (!value?.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.length > 100) {
          error = 'El nombre no puede superar los 100 caracteres';
        }
        break;
        
      case 'email':
        if (!value?.trim()) {
          error = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Ingrese un email válido';
        }
        break;
        
      case 'razon_social':
        if (!value?.trim()) {
          error = 'La razón social es obligatoria';
        } else if (value.length < 2) {
          error = 'La razón social debe tener al menos 2 caracteres';
        }
        break;
        
      case 'cuit':
        const cuitClean = value?.replace(/\s/g, '').replace(/-/g, '') || '';
        if (!cuitClean) {
          error = 'El CUIT es obligatorio';
        } else if (!/^\d{11}$/.test(cuitClean)) {
          error = 'El CUIT debe tener 11 dígitos';
        }
        break;
        
      case 'telefono':
        if (!value?.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (!/^[\d\s\-\+\(\)]{8,20}$/.test(value)) {
          error = 'Ingrese un número de teléfono válido';
        }
        break;
        
      case 'direccion':
        if (!value?.trim()) {
          error = 'La dirección es obligatoria';
        } else if (value.length < 10) {
          error = 'Ingrese una dirección completa (mínimo 10 caracteres)';
        }
        break;
        
      case 'descripcion':
        if (!value?.trim()) {
          error = 'La descripción es obligatoria';
        } else if (value.length < 50) {
          error = 'La descripción debe tener al menos 50 caracteres';
        } else if (value.length > 2000) {
          error = 'La descripción no puede superar los 2000 caracteres';
        }
        break;
        
      case 'password':
        if (value && value.length < 8) {
          error = 'La contraseña debe tener al menos 8 caracteres';
        }
        break;
        
      case 'password_confirmation':
        if (formData.password && value !== formData.password) {
          error = 'Las contraseñas no coinciden';
        }
        break;
        
      case 'sitio_web':
        if (value && !/^https?:\/\/.+/.test(value)) {
          error = 'Ingrese una URL válida (debe comenzar con http:// o https://)';
        }
        break;
        
      case 'linkedin_url':
        if (value && (!/^https?:\/\/.+/.test(value) || !value.includes('linkedin.com'))) {
          error = 'Ingrese una URL válida de LinkedIn';
        }
        break;
        
      case 'empleados_cantidad':
        if (value && (isNaN(value) || parseInt(value) < 1)) {
          error = 'Ingrese un número válido de empleados';
        }
        break;
        
      default:
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === '';
  };

  // Obtener clases CSS para campos con validación
  const getFieldClasses = (fieldName) => {
    const baseClass = 'form-control';
    const hasError = touchedFields[fieldName] && fieldErrors[fieldName];
    const hasValue = formData[fieldName] && formData[fieldName].toString().trim();
    
    if (hasError) {
      return `${baseClass} is-invalid`;
    } else if (touchedFields[fieldName] && hasValue) {
      return `${baseClass} is-valid`;
    }
    
    return baseClass;
  };

  // Para selects
  const getSelectClasses = (fieldName) => {
    const baseClass = 'form-select';
    const hasError = touchedFields[fieldName] && fieldErrors[fieldName];
    const hasValue = formData[fieldName] && formData[fieldName].toString().trim();
    
    if (hasError) {
      return `${baseClass} is-invalid`;
    } else if (touchedFields[fieldName] && hasValue) {
      return `${baseClass} is-valid`;
    }
    
    return baseClass;
  };

  // Renderizar feedback de validación
  const renderFieldFeedback = (fieldName) => {
    if (touchedFields[fieldName] && fieldErrors[fieldName]) {
      return <div className="invalid-feedback">{fieldErrors[fieldName]}</div>;
    } else if (touchedFields[fieldName] && formData[fieldName] && formData[fieldName].toString().trim() && !fieldErrors[fieldName]) {
      return <div className="valid-feedback">✓ Correcto</div>;
    }
    return null;
  };

  // Funciones para manejar drag & drop del logo
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleLogoFile(files[0]);
    }
  };

  const handleLogoFile = (file) => {
    // Limpiar errores previos
    setFieldErrors(prev => ({ ...prev, logo: '' }));
    
    // Validaciones
    if (file.size > 5 * 1024 * 1024) { // Aumentamos a 5MB
      setFieldErrors(prev => ({ ...prev, logo: 'El logo no puede superar los 5MB' }));
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setFieldErrors(prev => ({ ...prev, logo: 'Solo se permiten archivos de imagen (JPG, PNG, GIF, SVG)' }));
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewLogo(e.target.result);
    reader.readAsDataURL(file);

    // Actualizar formData
    setFormData(prev => ({
      ...prev,
      logo: file
    }));

    setLogoToDelete(false);
  };

  const removeLogo = () => {
    setPreviewLogo(null);
    setFormData(prev => ({
      ...prev,
      logo: null
    }));
    setLogoToDelete(true);
    
    // Limpiar input file
    const fileInput = document.querySelector('input[name="logo"]');
    if (fileInput) fileInput.value = '';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    let newValue = value;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file' && files && files[0]) {
      const file = files[0];
      
      // Limpiar errores previos
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
      
      if (name === 'logo') {
        handleLogoFile(file);
        return;
      }
      
      newValue = file;
    }
    
    // Actualizar formData
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validar campo después de un breve delay (excepto archivos)
    if (type !== 'file' && type !== 'checkbox') {
      setTimeout(() => {
        validateField(name, newValue);
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      // Si hay logo (archivo o eliminación), usar FormData
      if ((formData.logo && typeof formData.logo === 'object') || logoToDelete) {
        const formDataToSend = new FormData();
        
        // Agregar flag de eliminación de logo si corresponde
        if (logoToDelete) {
          formDataToSend.append('remove_logo', '1');
        }
        
        // Datos del usuario
        if (formData.name && formData.name.trim()) {
          formDataToSend.append('user_name', formData.name.trim());
        }
        if (formData.email && formData.email.trim()) {
          formDataToSend.append('user_email', formData.email.trim());
        }
        
        if (formData.password && formData.password.trim()) {
          formDataToSend.append('password', formData.password);
          formDataToSend.append('password_confirmation', formData.password_confirmation || '');
        }
        
        // Datos de la empresa - Campos requeridos siempre se envían
        formDataToSend.append('razon_social', formData.razon_social?.trim() || '');
        formDataToSend.append('telefono', formData.telefono?.trim() || '');
        
        // Campos opcionales
        if (formData.cuit) formDataToSend.append('cuit', formData.cuit.replace(/\s/g, '').replace(/-/g, ''));
        if (formData.direccion) formDataToSend.append('direccion', formData.direccion.trim());
        if (formData.descripcion) formDataToSend.append('descripcion', formData.descripcion.trim());
        
        if (formData.sector && formData.sector.trim()) {
          formDataToSend.append('sector', formData.sector.trim());
        }
        if (formData.empleados_cantidad && formData.empleados_cantidad.toString().trim()) {
          const empleados = parseInt(formData.empleados_cantidad, 10);
          if (!isNaN(empleados) && empleados > 0) {
            formDataToSend.append('tamaño_empresa', empleados);
          }
        }
        if (formData.sitio_web && formData.sitio_web.trim()) {
          formDataToSend.append('sitio_web', formData.sitio_web.trim());
        }
        if (formData.linkedin_url && formData.linkedin_url.trim()) {
          formDataToSend.append('linkedin_url', formData.linkedin_url.trim());
        }
        
        formDataToSend.append('logo', formData.logo);
        
        // Debug: mostrar los datos que se van a enviar
        console.log('Enviando con FormData (con logo):');
        for (let pair of formDataToSend.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
        
        response = await api.post(`/empresas/${empresaId}?_method=PUT`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
      } else {
        // Sin archivo, usar JSON
        const dataToSend = {
          // Datos del usuario
          ...(formData.name && formData.name.trim() && { user_name: formData.name.trim() }),
          ...(formData.email && formData.email.trim() && { user_email: formData.email.trim() }),
          ...(formData.password && formData.password.trim() && { 
            password: formData.password,
            password_confirmation: formData.password_confirmation || ''
          }),
          
          // Datos de la empresa - Campos requeridos
          razon_social: formData.razon_social?.trim() || '',
          telefono: formData.telefono?.trim() || '',
          
          // Campos opcionales
          ...(formData.cuit && { cuit: formData.cuit.replace(/\s/g, '').replace(/-/g, '') }),
          ...(formData.direccion && { direccion: formData.direccion.trim() }),
          ...(formData.descripcion && { descripcion: formData.descripcion.trim() }),
          ...(formData.sector && formData.sector.trim() && { sector: formData.sector.trim() }),
          ...(formData.sitio_web && formData.sitio_web.trim() && { sitio_web: formData.sitio_web.trim() }),
          ...(formData.linkedin_url && formData.linkedin_url.trim() && { linkedin_url: formData.linkedin_url.trim() }),
          
          // Tamaño empresa como número
          ...(formData.empleados_cantidad && formData.empleados_cantidad.toString().trim() && {
            tamaño_empresa: parseInt(formData.empleados_cantidad, 10)
          })
        };
        
        console.log('Enviando con JSON (sin logo):', dataToSend);
        
        response = await api.put(`/empresas/${empresaId}`, dataToSend);
      }
      
      if (response?.data?.success) {
        setSuccess('✅ Configuración actualizada correctamente');
        
        if (formData.name !== originalData.name || formData.email !== originalData.email) {
          await updateUserInfo({
            ...user,
            name: formData.name,
            email: formData.email
          });
        }
        
        await cargarConfiguracion();
        
        setTimeout(() => setSuccess(null), 5000);
      }
      
    } catch (err) {
      console.error('Error al guardar:', err);
      
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        setError(
          <div>
            <strong>Errores de validación:</strong>
            <ul className="mb-0 mt-2">
              {errorMessages.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        );
      } else {
        setError('Error al guardar los cambios. Verifique su conexión.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <h2 className="fw-bold mb-0">
                  <i className="bi bi-gear me-2"></i>
                  Configuración de Empresa
                </h2>
                <p className="text-muted mb-0">Gestiona tu información empresarial y configuración de cuenta</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </div>
        )}

        {/* Formulario */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                
                <form onSubmit={handleSubmit}>
                  
                  {/* Datos de Cuenta */}
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-person-circle me-2"></i>
                    Datos de Cuenta
                  </h5>
                  
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Nombre</label>
                      <input
                        type="text"
                        name="name"
                        className={getFieldClasses('name')}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      {renderFieldFeedback('name')}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        name="email"
                        className={getFieldClasses('email')}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      {renderFieldFeedback('email')}
                    </div>
                  </div>

                  <div className="mb-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                    >
                      <i className="bi bi-key me-2"></i>
                      {showPasswordFields ? 'Ocultar' : 'Cambiar'} Contraseña
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div className="row mb-4">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Nueva Contraseña</label>
                        <input
                          type="password"
                          name="password"
                          className={getFieldClasses('password')}
                          value={formData.password}
                          onChange={handleInputChange}
                          minLength="8"
                        />
                        {renderFieldFeedback('password')}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Confirmar Contraseña</label>
                        <input
                          type="password"
                          name="password_confirmation"
                          className={getFieldClasses('password_confirmation')}
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                        />
                        {renderFieldFeedback('password_confirmation')}
                      </div>
                    </div>
                  )}

                  <hr className="my-4" />

                  {/* Datos de Empresa */}
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-building me-2"></i>
                    Datos de Empresa
                  </h5>
                  
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Razón Social</label>
                      <input
                        type="text"
                        name="razon_social"
                        className={getFieldClasses('razon_social')}
                        value={formData.razon_social}
                        onChange={handleInputChange}
                        required
                      />
                      {renderFieldFeedback('razon_social')}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">CUIT</label>
                      <input
                        type="text"
                        name="cuit"
                        className={getFieldClasses('cuit')}
                        value={formData.cuit}
                        onChange={handleInputChange}
                        placeholder="20-12345678-9"
                        required
                      />
                      {renderFieldFeedback('cuit')}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        className={getFieldClasses('telefono')}
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                      />
                      {renderFieldFeedback('telefono')}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Sector</label>
                      <select
                        name="sector"
                        className={getSelectClasses('sector')}
                        value={formData.sector}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccionar sector</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Salud">Salud</option>
                        <option value="Educación">Educación</option>
                        <option value="Finanzas">Finanzas</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufactura">Manufactura</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Otro">Otro</option>
                      </select>
                      {renderFieldFeedback('sector')}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      className={getFieldClasses('direccion')}
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                    />
                    {renderFieldFeedback('direccion')}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descripción de la Empresa</label>
                    <textarea
                      name="descripcion"
                      className={getFieldClasses('descripcion')}
                      rows="4"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Describe tu empresa, sus actividades y valores..."
                      required
                    />
                    {renderFieldFeedback('descripcion')}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Sitio Web</label>
                      <input
                        type="url"
                        name="sitio_web"
                        className={getFieldClasses('sitio_web')}
                        value={formData.sitio_web}
                        onChange={handleInputChange}
                        placeholder="https://..."
                      />
                      {renderFieldFeedback('sitio_web')}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">LinkedIn</label>
                      <input
                        type="url"
                        name="linkedin_url"
                        className={getFieldClasses('linkedin_url')}
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/company/..."
                      />
                      {renderFieldFeedback('linkedin_url')}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Cantidad de Empleados</label>
                    <input
                      type="number"
                      name="empleados_cantidad"
                      className={getFieldClasses('empleados_cantidad')}
                      value={formData.empleados_cantidad}
                      onChange={handleInputChange}
                      min="1"
                      max="999999"
                      placeholder="Ej: 25"
                    />
                    {renderFieldFeedback('empleados_cantidad')}
                    <div className="form-text">Ingrese el número aproximado de empleados de su empresa</div>
                  </div>

                  {/* Logo de la Empresa - Sección Mejorada */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-3">
                      <i className="bi bi-image me-2 text-primary"></i>
                      Logo de la Empresa
                    </label>
                    
                    <div className="logo-upload-container">
                      {/* Area de upload con drag & drop */}
                      <div 
                        className={`logo-upload-area ${isDragOver ? 'drag-over' : ''} ${fieldErrors.logo ? 'error' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('logo-input').click()}
                      >
                        {previewLogo ? (
                          // Preview del logo
                          <div className="logo-preview-container">
                            <div className="logo-preview-wrapper">
                              <img 
                                src={previewLogo} 
                                alt="Logo de la empresa" 
                                className="logo-preview-image"
                              />
                              <div className="logo-overlay">
                                <div className="logo-actions">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light me-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      document.getElementById('logo-input').click();
                                    }}
                                    title="Cambiar logo"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeLogo();
                                    }}
                                    title="Eliminar logo"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="logo-info">
                              <small className="text-muted">
                                <i className="bi bi-info-circle me-1"></i>
                                Haz clic para cambiar o arrastra una nueva imagen
                              </small>
                            </div>
                          </div>
                        ) : (
                          // Area de upload vacía
                          <div className="logo-upload-empty">
                            <div className="upload-icon">
                              <i className="bi bi-cloud-upload display-4 text-primary"></i>
                            </div>
                            <div className="upload-text">
                              <p className="mb-2 fw-semibold">Arrastra tu logo aquí</p>
                              <p className="mb-0 text-muted small">
                                o <span className="text-primary">haz clic para seleccionar</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input file oculto */}
                      <input
                        id="logo-input"
                        type="file"
                        name="logo"
                        className="d-none"
                        onChange={handleInputChange}
                        accept="image/*"
                      />

                      {/* Información y especificaciones */}
                      <div className="logo-specifications mt-3">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="spec-item">
                              <i className="bi bi-file-earmark-image text-success me-2"></i>
                              <span className="small text-muted">
                                Formatos: <strong>JPG, PNG, GIF, SVG</strong>
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="spec-item">
                              <i className="bi bi-hdd text-info me-2"></i>
                              <span className="small text-muted">
                                Tamaño máximo: <strong>5MB</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="row mt-2">
                          <div className="col-12">
                            <div className="spec-item">
                              <i className="bi bi-aspect-ratio text-warning me-2"></i>
                              <span className="small text-muted">
                                Recomendado: <strong>Formato cuadrado (1:1)</strong> para mejor visualización
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Error de validación */}
                      {fieldErrors.logo && (
                        <div className="invalid-feedback d-block mt-2">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {fieldErrors.logo}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => navigate('/empresa')}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Volver
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Guardar Configuración
                        </>
                      )}
                    </button>
                  </div>

                </form>
                
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <style jsx>{`
      .logo-upload-container {
        border: 1px solid #e9ecef;
        border-radius: 12px;
        background: #f8f9fa;
        padding: 1rem;
      }

      .logo-upload-area {
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        padding: 2rem 1rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: white;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .logo-upload-area:hover {
        border-color: #007bff;
        background: #f8f9ff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
      }

      .logo-upload-area.drag-over {
        border-color: #28a745;
        background: #f8fff9;
        transform: scale(1.02);
      }

      .logo-upload-area.error {
        border-color: #dc3545;
        background: #fff5f5;
      }

      .logo-upload-empty {
        width: 100%;
      }

      .upload-icon {
        margin-bottom: 1rem;
        opacity: 0.7;
      }

      .upload-text p {
        margin: 0.25rem 0;
      }

      .logo-preview-container {
        width: 100%;
        max-width: 300px;
      }

      .logo-preview-wrapper {
        position: relative;
        display: inline-block;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        background: white;
        padding: 0.5rem;
      }

      .logo-preview-image {
        width: 200px;
        height: 200px;
        object-fit: contain;
        border-radius: 6px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
      }

      .logo-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 8px;
      }

      .logo-preview-wrapper:hover .logo-overlay {
        opacity: 1;
      }

      .logo-actions {
        display: flex;
        gap: 0.5rem;
      }

      .logo-info {
        margin-top: 1rem;
        text-align: center;
      }

      .logo-specifications {
        background: white;
        border-radius: 6px;
        padding: 0.75rem;
        border: 1px solid #e9ecef;
      }

      .spec-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.25rem;
      }

      .spec-item:last-child {
        margin-bottom: 0;
      }

      .spec-item strong {
        color: #495057;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .logo-upload-area {
          padding: 1.5rem 1rem;
          min-height: 160px;
        }

        .logo-preview-image {
          width: 150px;
          height: 150px;
        }

        .upload-icon i {
          font-size: 2.5rem !important;
        }
      }

      @media (max-width: 576px) {
        .logo-specifications .row {
          margin: 0;
        }

        .logo-specifications .col-md-6 {
          padding: 0.25rem 0;
        }
      }
    `}</style>
    </>
  );
}
