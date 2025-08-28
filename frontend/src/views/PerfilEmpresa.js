import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PerfilEmpresaMejorado() {
  const { user, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const [formData, setFormData] = useState({
    // Datos del usuario (tabla users)
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    
    // Datos de la empresa (tabla empresas)
    empresaId: null,
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
    estado_verificacion: 'pendiente'
  });

  const [originalData, setOriginalData] = useState({});
  const [previewLogo, setPreviewLogo] = useState(null);

  // Cargar datos de la empresa al montar
  useEffect(() => {
    const loadEmpresaData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/empresas/by-user/${user.id}`);
        const empresa = response.data;
        
        const empresaData = {
          name: empresa.user?.name || '',
          email: empresa.user?.email || '',
          password: '',
          password_confirmation: '',
          empresaId: empresa.id,
          razon_social: empresa.razon_social || '',
          cuit: empresa.cuit || '',
          telefono: empresa.telefono || '',
          direccion: empresa.direccion || '',
          descripcion: empresa.descripcion || '',
          sitio_web: empresa.sitio_web || '',
          linkedin_url: empresa.linkedin_url || '',
          sector: empresa.sector || '',
          empleados_cantidad: empresa.empleados_cantidad || '',
          logo: empresa.logo_path,
          estado_verificacion: empresa.estado_verificacion || 'pendiente'
        };
        
        setFormData(empresaData);
        setOriginalData(empresaData);
        
        if (empresa.logo_path) {
          setPreviewLogo(empresa.logo_path);
        }
        
      } catch (err) {
        console.error('Error al cargar empresa:', err);
        if (err.response?.status === 404) {
          setError('No se encontró el perfil de empresa. Contacte al administrador.');
        } else {
          setError('Error al cargar los datos del perfil empresarial');
        }
      } finally {
        setLoading(false);
      }
    };

    loadEmpresaData();
  }, [user?.id]);

  // Función para recargar datos después de guardar
  const reloadData = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Recargando datos de empresa...');
      const response = await api.get(`/empresas/by-user/${user.id}`);
      const empresa = response.data;
      console.log('Datos recargados desde servidor:', empresa);
      
      const empresaData = {
        name: empresa.user?.name || '',
        email: empresa.user?.email || '',
        password: '',
        password_confirmation: '',
        empresaId: empresa.id,
        razon_social: empresa.razon_social || '',
        cuit: empresa.cuit || '',
        telefono: empresa.telefono || '',
        direccion: empresa.direccion || '',
        descripcion: empresa.descripcion || '',
        sitio_web: empresa.sitio_web || '',
        linkedin_url: empresa.linkedin_url || '',
        sector: empresa.sector || '',
        empleados_cantidad: empresa.empleados_cantidad || '',
        logo: empresa.logo_path,
        estado_verificacion: empresa.estado_verificacion || 'pendiente'
      };
      
      console.log('Datos procesados para formulario:', empresaData);
      
      setFormData(empresaData);
      setOriginalData(empresaData);
      
      if (empresa.logo_path) {
        setPreviewLogo(empresa.logo_path);
      }
      
    } catch (err) {
      console.error('Error al recargar datos:', err);
    }
  };

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

    // Validar campo en tiempo real
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    
    // Lista de campos obligatorios
    const requiredFields = ['name', 'email', 'razon_social', 'cuit', 'telefono', 'direccion', 'descripcion'];
    
    switch (name) {
      case 'name':
        if (!value?.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      
      case 'email':
        if (!value?.trim()) {
          error = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Ingrese un email válido';
        }
        break;
      
      case 'razon_social':
        if (!value?.trim()) {
          error = 'La razón social es obligatoria';
        } else if (value.length < 3) {
          error = 'La razón social debe tener al menos 3 caracteres';
        }
        break;
      
      case 'cuit':
        if (!value?.trim()) {
          error = 'El CUIT es obligatorio';
        } else if (!/^\d{2}-?\d{8}-?\d{1}$/.test(value.replace(/\s/g, ''))) {
          error = 'Formato de CUIT inválido (XX-XXXXXXXX-X)';
        }
        break;
      
      case 'telefono':
        if (!value?.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (!/^[\d\s\-+()]+$/.test(value)) {
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
          error = 'La descripción de la empresa es obligatoria';
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

  // Función para manejar la descarga/visualización del logo
  const handleViewLogo = () => {
    if (formData.logo) {
      const logoUrl = formData.logo.startsWith('http') ? formData.logo : `http://localhost:8000${formData.logo}`;
      window.open(logoUrl, '_blank');
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Limpiar errores previos
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
      setError(null);
      
      // Validar tamaño y tipo de archivo para logo
      if (name === 'logo') {
        if (file.size > 2048 * 1024) { // 2MB
          const errorMsg = 'El logo no puede superar los 2MB';
          setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
          return;
        }
        if (!file.type.startsWith('image/')) {
          const errorMsg = 'Solo se permiten archivos de imagen (JPG, PNG, GIF)';
          setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Preview para logo
      if (name === 'logo') {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewLogo(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const validateForm = () => {
    const errors = [];
    const newFieldErrors = {};
    
    // Campos obligatorios para empresas
    const requiredFields = [
      { field: 'name', label: 'nombre' },
      { field: 'email', label: 'email' },
      { field: 'razon_social', label: 'razón social' },
      { field: 'cuit', label: 'CUIT' },
      { field: 'telefono', label: 'teléfono' },
      { field: 'direccion', label: 'dirección' },
      { field: 'descripcion', label: 'descripción de la empresa' }
    ];
    
    // Validar todos los campos obligatorios
    requiredFields.forEach(({ field, label }) => {
      if (!formData[field]?.trim()) {
        errors.push(`El campo ${label} es obligatorio`);
        newFieldErrors[field] = `${label.charAt(0).toUpperCase() + label.slice(1)} es obligatorio`;
      }
    });
    
    // Validaciones específicas adicionales
    if (formData.name?.trim() && formData.name.length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
      newFieldErrors.name = 'Mínimo 2 caracteres';
    }
    
    if (formData.email?.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('El email no tiene un formato válido');
      newFieldErrors.email = 'Ingrese un email válido';
    }
    
    if (formData.razon_social?.trim() && formData.razon_social.length < 3) {
      errors.push('La razón social debe tener al menos 3 caracteres');
      newFieldErrors.razon_social = 'Mínimo 3 caracteres';
    }
    
    if (formData.cuit?.trim() && !/^\d{2}-?\d{8}-?\d{1}$/.test(formData.cuit.replace(/\s/g, ''))) {
      errors.push('El formato del CUIT no es válido');
      newFieldErrors.cuit = 'Formato inválido (XX-XXXXXXXX-X)';
    }
    
    if (formData.descripcion?.trim()) {
      if (formData.descripcion.length < 50) {
        errors.push('La descripción debe ser más detallada (mínimo 50 caracteres)');
        newFieldErrors.descripcion = 'Mínimo 50 caracteres';
      } else if (formData.descripcion.length > 2000) {
        errors.push('La descripción no puede superar los 2000 caracteres');
        newFieldErrors.descripcion = 'Máximo 2000 caracteres';
      }
    }
    
    // Validar contraseñas solo si se están cambiando
    if (showPasswordFields && (formData.password || formData.password_confirmation)) {
      if (!formData.password) {
        errors.push('Ingrese la nueva contraseña');
        newFieldErrors.password = 'Este campo es obligatorio';
      } else if (formData.password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
        newFieldErrors.password = 'Mínimo 8 caracteres';
      }
      
      if (!formData.password_confirmation) {
        errors.push('Confirme la nueva contraseña');
        newFieldErrors.password_confirmation = 'Este campo es obligatorio';
      } else if (formData.password !== formData.password_confirmation) {
        errors.push('Las contraseñas no coinciden');
        newFieldErrors.password_confirmation = 'Las contraseñas no coinciden';
      }
    }
    
    // Validaciones opcionales
    if (formData.sitio_web && !/^https?:\/\/.+/.test(formData.sitio_web)) {
      errors.push('El sitio web debe ser una URL válida');
      newFieldErrors.sitio_web = 'Debe comenzar con http:// o https://';
    }
    
    if (formData.linkedin_url && (!/^https?:\/\/.+/.test(formData.linkedin_url) || !formData.linkedin_url.includes('linkedin.com'))) {
      errors.push('El enlace de LinkedIn debe ser una URL válida de LinkedIn');
      newFieldErrors.linkedin_url = 'URL de LinkedIn inválida';
    }
    
    setFieldErrors(newFieldErrors);
    
    if (errors.length > 0) {
      setError(
        <div>
          <strong>Por favor, corrija los siguientes errores:</strong>
          <ul className="mb-0 mt-2">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      );
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario antes de continuar');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Datos del usuario
      formDataToSend.append('user_name', formData.name);
      formDataToSend.append('user_email', formData.email);
      if (formData.password) {
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password_confirmation', formData.password_confirmation);
      }
      
      // Datos de la empresa
      formDataToSend.append('razon_social', formData.razon_social);
      formDataToSend.append('cuit', formData.cuit.replace(/\s/g, ''));
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('direccion', formData.direccion);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('sector', formData.sector);
      
      // Campos opcionales
      if (formData.tamaño_empresa) formDataToSend.append('tamaño_empresa', formData.tamaño_empresa);
      if (formData.año_fundacion) formDataToSend.append('año_fundacion', formData.año_fundacion);
      if (formData.email_contacto) formDataToSend.append('email_contacto', formData.email_contacto);
      if (formData.persona_contacto) formDataToSend.append('persona_contacto', formData.persona_contacto);
      if (formData.sitio_web) formDataToSend.append('sitio_web', formData.sitio_web);
      if (formData.linkedin_url) formDataToSend.append('linkedin_url', formData.linkedin_url);
      
      // Archivo de logo
      if (formData.logo && typeof formData.logo === 'object') {
        formDataToSend.append('logo', formData.logo);
      }
      
      const response = await api.post(`/empresas/${formData.empresaId}?_method=PUT`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setSuccess('✅ Perfil actualizado correctamente');
        setEditMode(false);
        
        // Actualizar datos en AuthContext si hay cambios de usuario
        if (formData.name !== originalData.name || formData.email !== originalData.email) {
          await updateUserInfo({
            ...user,
            name: formData.name,
            email: formData.email
          });
        }
        
        // Recargar datos actualizados
        await reloadData();
        
        // Auto-ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
        
      } else {
        setError('Error al actualizar el perfil. Inténtelo nuevamente.');
      }
      
    } catch (err) {
      console.error('Error al guardar:', err);
      
      if (err.response?.status === 422) {
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
      } else {
        setError('Error al guardar los cambios. Verifique su conexión e inténtelo nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData(originalData);
    setEditMode(false);
    setShowPasswordFields(false);
    setFieldErrors({});
    setTouchedFields({});
    setError(null);
    setSuccess(null);
  };

  // Helper function para clases de validación
  const getFieldClasses = (fieldName) => {
    const baseClasses = 'form-control';
    if (!editMode || !touchedFields[fieldName]) return baseClasses;
    
    if (fieldErrors[fieldName]) {
      return `${baseClasses} is-invalid`;
    } else if (touchedFields[fieldName] && !fieldErrors[fieldName]) {
      return `${baseClasses} is-valid`;
    }
    
    return baseClasses;
  };

  // Helper function para mostrar feedback de validación
  const renderFieldFeedback = (fieldName) => {
    if (!editMode || !touchedFields[fieldName]) return null;
    
    if (fieldErrors[fieldName]) {
      return <div className="invalid-feedback d-block">{fieldErrors[fieldName]}</div>;
    } else if (touchedFields[fieldName] && !fieldErrors[fieldName]) {
      return <div className="valid-feedback d-block">✓ Correcto</div>;
    }
    
    return null;
  };

  // Función para obtener el estado de verificación con estilo
  const getEstadoVerificacion = () => {
    switch (formData.estado_verificacion) {
      case 'verificada':
        return (
          <span className="badge bg-success fs-6">
            <i className="bi bi-shield-check me-1"></i>
            Empresa Verificada
          </span>
        );
      case 'pendiente':
        return (
          <span className="badge bg-warning fs-6">
            <i className="bi bi-clock me-1"></i>
            Verificación Pendiente
          </span>
        );
      case 'rechazada':
        return (
          <span className="badge bg-danger fs-6">
            <i className="bi bi-shield-x me-1"></i>
            Verificación Rechazada
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary fs-6">
            <i className="bi bi-question-circle me-1"></i>
            No Verificada
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando perfil empresarial...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <div className="card-header border-0 text-center py-4" style={{ background: 'linear-gradient(135deg, #fffde7 80%, #ffe082 100%)', borderRadius: '20px 20px 0 0' }}>
                
                {/* Header con logo y datos básicos */}
                <div className="d-flex flex-column align-items-center position-relative">
                  
                  {/* Logo de la empresa */}
                  <div className="position-relative mb-3" style={{ width: 120, height: 120 }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ 
                           width: 120, 
                           height: 120, 
                           background: 'linear-gradient(135deg, #fbc02d 60%, #fffde7 100%)', 
                           boxShadow: '0 0 32px #fbc02d55', 
                           border: '4px solid #fff' 
                         }}>
                      {previewLogo ? (
                        <img 
                          src={previewLogo} 
                          alt="Logo empresarial" 
                          style={{ 
                            width: 110, 
                            height: 110, 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            boxShadow: '0 0 12px #fbc02d88' 
                          }} 
                        />
                      ) : (
                        <i className="bi bi-building text-white" style={{ fontSize: '4.5rem' }}></i>
                      )}
                    </div>
                    
                    {editMode && (
                      <div className="position-absolute bottom-0 end-0">
                        <label className="btn btn-sm btn-warning rounded-circle" style={{ width: 35, height: 35 }}>
                          <i className="bi bi-camera"></i>
                          <input 
                            type="file" 
                            name="logo"
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="d-none"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="fw-bold mb-1 text-warning">{formData.name || formData.razon_social}</h3>
                  <p className="text-muted mb-2">{formData.email}</p>
                  
                  {/* Estado de verificación */}
                  <div className="mb-2">
                    {getEstadoVerificacion()}
                  </div>
                  
                  {/* Mostrar archivo de logo disponible */}
                  {!editMode && formData.logo && (
                    <div className="mt-2">
                      <button 
                        type="button"
                        onClick={handleViewLogo}
                        className="btn btn-sm btn-outline-warning"
                      >
                        <i className="bi bi-eye me-1"></i>Ver Logo
                      </button>
                    </div>
                  )}

                </div>
              </div>

              <div className="card-body p-4">
                
                {/* Alertas de error y éxito */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                  </div>
                )}
                
                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    
                    {/* Datos básicos del usuario */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nombre de Usuario *</label>
                      <input 
                        type="text" 
                        name="name"
                        className={getFieldClasses('name')}
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                      />
                      {renderFieldFeedback('name')}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email *</label>
                      <input 
                        type="email" 
                        name="email"
                        className={getFieldClasses('email')}
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                      />
                      {renderFieldFeedback('email')}
                    </div>

                    {/* Cambio de contraseña */}
                    {editMode && (
                      <div className="col-12">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h6 className="text-secondary mb-0">
                            <i className="bi bi-key me-2"></i>
                            Cambiar Contraseña
                          </h6>
                          <button 
                            type="button" 
                            className={`btn btn-sm ${showPasswordFields ? 'btn-warning' : 'btn-outline-secondary'}`}
                            onClick={() => setShowPasswordFields(!showPasswordFields)}
                          >
                            {showPasswordFields ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                        {showPasswordFields && (
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nueva Contraseña</label>
                              <input 
                                type="password" 
                                name="password"
                                className={getFieldClasses('password')}
                                value={formData.password}
                                onChange={handleInputChange}
                                minLength={8}
                                placeholder="Mínimo 8 caracteres"
                              />
                              {renderFieldFeedback('password')}
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Confirmar Contraseña</label>
                              <input 
                                type="password" 
                                name="password_confirmation"
                                className={getFieldClasses('password_confirmation')}
                                value={formData.password_confirmation}
                                onChange={handleInputChange}
                                placeholder="Repetir contraseña"
                              />
                              {renderFieldFeedback('password_confirmation')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Datos empresariales */}
                    <div className="col-12 mt-4">
                      <h5 className="text-warning mb-3">
                        <i className="bi bi-building me-2"></i>
                        Información Empresarial
                      </h5>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Razón Social *</label>
                      <input 
                        type="text" 
                        name="razon_social"
                        className={getFieldClasses('razon_social')}
                        value={formData.razon_social}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                      />
                      {renderFieldFeedback('razon_social')}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">CUIT *</label>
                      <input 
                        type="text" 
                        name="cuit"
                        className={getFieldClasses('cuit')}
                        value={formData.cuit}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="XX-XXXXXXXX-X"
                        required
                      />
                      {renderFieldFeedback('cuit')}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Teléfono *</label>
                      <input 
                        type="tel" 
                        name="telefono"
                        className={getFieldClasses('telefono')}
                        value={formData.telefono}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                      />
                      {renderFieldFeedback('telefono')}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Sector</label>
                      <input 
                        type="text" 
                        name="sector"
                        className={getFieldClasses('sector')}
                        value={formData.sector}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Ej: Tecnología, Salud, Finanzas..."
                      />
                      {renderFieldFeedback('sector')}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Dirección *</label>
                      <input 
                        type="text" 
                        name="direccion"
                        className={getFieldClasses('direccion')}
                        value={formData.direccion}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                      />
                      {renderFieldFeedback('direccion')}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Descripción de la Empresa *</label>
                      <textarea 
                        name="descripcion"
                        className={getFieldClasses('descripcion')}
                        rows={4}
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Describe la empresa, su misión, valores, productos o servicios..."
                        maxLength={2000}
                        required
                      />
                      <div className="form-text text-end">
                        {formData.descripcion.length}/2000 caracteres
                      </div>
                      {renderFieldFeedback('descripcion')}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Sitio Web</label>
                      <input 
                        type="url" 
                        name="sitio_web"
                        className={getFieldClasses('sitio_web')}
                        value={formData.sitio_web}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="https://www.empresa.com"
                      />
                      {renderFieldFeedback('sitio_web')}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">LinkedIn</label>
                      <input 
                        type="url" 
                        name="linkedin_url"
                        className={getFieldClasses('linkedin_url')}
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="https://linkedin.com/company/empresa"
                      />
                      {renderFieldFeedback('linkedin_url')}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Cantidad de Empleados</label>
                      <input 
                        type="number" 
                        name="empleados_cantidad"
                        className={getFieldClasses('empleados_cantidad')}
                        value={formData.empleados_cantidad}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Número aproximado"
                        min="1"
                      />
                      {renderFieldFeedback('empleados_cantidad')}
                    </div>

                    {/* Logo empresarial */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Logo Empresarial</label>
                      {editMode ? (
                        <>
                          <input 
                            type="file" 
                            name="logo"
                            className={getFieldClasses('logo')}
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          {renderFieldFeedback('logo')}
                        </>
                      ) : (
                        <div className="form-control d-flex align-items-center justify-content-between">
                          {formData.logo ? (
                            <>
                              <span>
                                <i className="bi bi-image text-warning me-2"></i>
                                Logo disponible
                              </span>
                              <button
                                type="button"
                                onClick={handleViewLogo}
                                className="btn btn-sm btn-outline-warning"
                              >
                                <i className="bi bi-eye me-1"></i>Ver
                              </button>
                            </>
                          ) : (
                            <span className="text-muted">No hay logo cargado</span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Botones de acción */}
                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    {!editMode ? (
                      <button 
                        type="button" 
                        className="btn btn-warning px-4"
                        onClick={() => setEditMode(true)}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Editar Perfil
                      </button>
                    ) : (
                      <>
                        <button 
                          type="button" 
                          className="btn btn-secondary px-4"
                          onClick={cancelEdit}
                        >
                          <i className="bi bi-x-lg me-2"></i>
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-success px-4"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-lg me-2"></i>
                              Guardar Cambios
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
