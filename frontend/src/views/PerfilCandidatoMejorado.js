import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PerfilCandidatoMejorado() {
  const { user, updateUserInfo } = useAuth();
  const { id: candidatoId } = useParams(); // ID del candidato desde la URL
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isOwnProfile, setIsOwnProfile] = useState(false); // Indica si es el perfil propio

  const [formData, setFormData] = useState({
    // Datos del usuario (tabla users)
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    
    // Datos del candidato (tabla candidatos)
    candidatoId: null,
    apellido: '',
    telefono: '',
    direccion: '',
    bio: '',
    habilidades: '',
    linkedin: '',
    experiencia_resumida: '',
    educacion_resumida: '',
    avatar: null,
    cv: null
  });

  const [originalData, setOriginalData] = useState({});
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // Cargar datos del candidato al montar
  useEffect(() => {
    const loadCandidatoData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (candidatoId) {
          // Viendo perfil de otro candidato
          response = await api.get(`/candidatos/${candidatoId}`);
          setIsOwnProfile(false);
          setEditMode(false); // No permitir edición de otros perfiles
        } else if (user?.id) {
          // Viendo perfil propio
          response = await api.get(`/candidatos/by-user/${user.id}`);
          setIsOwnProfile(true);
          // Habilitar edición inmediata para perfil propio si está incompleto
          const candidato = response.data;
          if (!candidato.bio || !candidato.habilidades || !candidato.telefono) {
            setEditMode(true);
          }
        } else {
          return;
        }
        
        const candidato = response.data;
        
        const userData = {
          name: candidato.user?.name || '',
          email: candidato.user?.email || '',
          password: '',
          password_confirmation: '',
          candidatoId: candidato.id,
          apellido: candidato.apellido || '',
          telefono: candidato.telefono || '',
          direccion: candidato.direccion || '',
          bio: candidato.bio || '',
          habilidades: candidato.habilidades || '',
          linkedin: candidato.linkedin || '',
          experiencia_resumida: candidato.experiencia_resumida || '',
          educacion_resumida: candidato.educacion_resumida || '',
          avatar: candidato.avatar,
          cv: candidato.cv_path
        };
        
        setFormData(userData);
        setOriginalData(userData);
        
        if (candidato.avatar) {
          setPreviewAvatar(candidato.avatar);
        }
        
      } catch (err) {
        console.error('Error al cargar candidato:', err);
        if (err.response?.status === 404) {
          setError('No se encontró el perfil de candidato. Contacte al administrador.');
        } else {
          setError('Error al cargar los datos del perfil');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCandidatoData();
  }, [user?.id, candidatoId]);

  // Función para recargar datos después de guardar
  const reloadData = async () => {
    if (!user?.id) return;
    
    try {
      const response = await api.get(`/candidatos/by-user/${user.id}`);
      const candidato = response.data;
      
      const userData = {
        name: candidato.user?.name || '',
        email: candidato.user?.email || '',
        password: '',
        password_confirmation: '',
        candidatoId: candidato.id,
        apellido: candidato.apellido || '',
        telefono: candidato.telefono || '',
        direccion: candidato.direccion || '',
        bio: candidato.bio || '',
        habilidades: candidato.habilidades || '',
        linkedin: candidato.linkedin || '',
        experiencia_resumida: candidato.experiencia_resumida || '',
        educacion_resumida: candidato.educacion_resumida || '',
        avatar: candidato.avatar,
        cv: candidato.cv_path
      };
      
      setFormData(userData);
      setOriginalData(userData);
      
      if (candidato.avatar) {
        setPreviewAvatar(candidato.avatar);
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
    
    // Lista de campos obligatorios (excluyendo información personal opcional)
    const requiredFields = ['name', 'email', 'apellido', 'telefono', 'direccion', 'bio', 'habilidades', 'experiencia_resumida', 'educacion_resumida'];
    
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
      
      case 'apellido':
        if (!value?.trim()) {
          error = 'El apellido es obligatorio';
        } else if (value.length < 2) {
          error = 'El apellido debe tener al menos 2 caracteres';
        }
        break;
      
      case 'telefono':
        if (!value?.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (!/^[\d\s\-\+\(\)]+$/.test(value)) {
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
      
      case 'bio':
        if (!value?.trim()) {
          error = 'La biografía profesional es obligatoria';
        } else if (value.length < 50) {
          error = 'La biografía debe tener al menos 50 caracteres';
        } else if (value.length > 1000) {
          error = 'La biografía no puede superar los 1000 caracteres';
        }
        break;
      
      case 'habilidades':
        if (!value?.trim()) {
          error = 'Las habilidades son obligatorias';
        } else if (value.length < 10) {
          error = 'Describa al menos 3 habilidades relevantes';
        }
        break;
      
      case 'experiencia_resumida':
        if (!value?.trim()) {
          error = 'La experiencia laboral es obligatoria';
        } else if (value.length < 20) {
          error = 'Describa su experiencia laboral (mínimo 20 caracteres)';
        }
        break;
      
      case 'educacion_resumida':
        if (!value?.trim()) {
          error = 'La información educativa es obligatoria';
        } else if (value.length < 10) {
          error = 'Describa su formación académica (mínimo 10 caracteres)';
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
      
      case 'linkedin':
        // LinkedIn es opcional, solo validar si tiene valor
        if (value && !/^https?:\/\/.+/.test(value)) {
          error = 'Ingrese una URL válida (debe comenzar con http:// o https://)';
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

  // Función para manejar la descarga del CV
  const handleDownloadCV = (e) => {
    e.preventDefault();
    
    const cvUrl = formData.cv.startsWith('http') ? formData.cv : `http://localhost:8000${formData.cv}`;
    const fileName = `CV_${formData.name}_${formData.apellido || 'Candidato'}.pdf`;
    
    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = fileName;
    link.target = '_blank';
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Limpiar errores previos
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
      setError(null);
      
      // Validar tamaño de archivo
      if (name === 'avatar') {
        if (file.size > 2048 * 1024) { // 2MB
          const errorMsg = 'La imagen no puede superar los 2MB';
          setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
          return;
        }
        if (!file.type.startsWith('image/')) {
          const errorMsg = 'Solo se permiten archivos de imagen (JPG, PNG, GIF)';
          setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
          return;
        }
      }
      
      if (name === 'cv') {
        if (file.size > 5120 * 1024) { // 5MB
          const errorMsg = 'El CV no puede superar los 5MB';
          setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
          return;
        }
        if (file.type !== 'application/pdf') {
          const errorMsg = 'Solo se permiten archivos PDF para el CV';
          setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Preview para avatar
      if (name === 'avatar') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewAvatar(reader.result);
        };
        reader.readAsDataURL(file);
      }

      // Mostrar éxito para archivos válidos
      setFieldErrors(prev => ({ 
        ...prev, 
        [name]: '',
        [`${name}_success`]: `${name === 'avatar' ? 'Imagen' : 'CV'} cargado correctamente`
      }));
    }
  };

  const validateForm = () => {
    const errors = [];
    const newFieldErrors = {};
    
    // Campos obligatorios (excluyendo información personal opcional como LinkedIn)
    const requiredFields = [
      { field: 'name', label: 'nombre' },
      { field: 'email', label: 'email' },
      { field: 'apellido', label: 'apellido' },
      { field: 'telefono', label: 'teléfono' },
      { field: 'direccion', label: 'dirección' },
      { field: 'bio', label: 'biografía profesional' },
      { field: 'habilidades', label: 'habilidades' },
      { field: 'experiencia_resumida', label: 'experiencia laboral' },
      { field: 'educacion_resumida', label: 'información educativa' }
    ];
    
    // Validar todos los campos obligatorios
    requiredFields.forEach(({ field, label }) => {
      if (!formData[field]?.trim()) {
        errors.push(`El campo ${label} es obligatorio`);
        newFieldErrors[field] = `El ${label} es obligatorio`;
      }
    });
    
    // Validaciones específicas para campos obligatorios con reglas adicionales
    if (formData.name?.trim()) {
      if (formData.name.length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
        newFieldErrors.name = 'Mínimo 2 caracteres';
      }
    }
    
    if (formData.email?.trim()) {
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.push('El email no tiene un formato válido');
        newFieldErrors.email = 'Ingrese un email válido';
      }
    }
    
    if (formData.apellido?.trim()) {
      if (formData.apellido.length < 2) {
        errors.push('El apellido debe tener al menos 2 caracteres');
        newFieldErrors.apellido = 'Mínimo 2 caracteres';
      }
    }
    
    if (formData.telefono?.trim()) {
      if (!/^[\d\s\-\+\(\)]+$/.test(formData.telefono)) {
        errors.push('El formato del teléfono no es válido');
        newFieldErrors.telefono = 'Solo números, espacios, guiones y paréntesis';
      }
    }
    
    if (formData.direccion?.trim()) {
      if (formData.direccion.length < 10) {
        errors.push('La dirección debe ser más específica (mínimo 10 caracteres)');
        newFieldErrors.direccion = 'Ingrese una dirección completa';
      }
    }
    
    if (formData.bio?.trim()) {
      if (formData.bio.length < 50) {
        errors.push('La biografía debe ser más detallada (mínimo 50 caracteres)');
        newFieldErrors.bio = 'Mínimo 50 caracteres';
      } else if (formData.bio.length > 1000) {
        errors.push('La biografía no puede superar los 1000 caracteres');
        newFieldErrors.bio = 'Máximo 1000 caracteres';
      }
    }
    
    if (formData.habilidades?.trim()) {
      if (formData.habilidades.length < 10) {
        errors.push('Describa al menos 3 habilidades relevantes');
        newFieldErrors.habilidades = 'Mínimo 10 caracteres';
      }
    }
    
    if (formData.experiencia_resumida?.trim()) {
      if (formData.experiencia_resumida.length < 20) {
        errors.push('Describa su experiencia laboral con más detalle');
        newFieldErrors.experiencia_resumida = 'Mínimo 20 caracteres';
      }
    }
    
    if (formData.educacion_resumida?.trim()) {
      if (formData.educacion_resumida.length < 10) {
        errors.push('Describa su formación académica');
        newFieldErrors.educacion_resumida = 'Mínimo 10 caracteres';
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
    
    // Validar LinkedIn solo si se proporciona (campo opcional)
    if (formData.linkedin && !/^https?:\/\/.+/.test(formData.linkedin)) {
      errors.push('El enlace de LinkedIn debe ser una URL válida');
      newFieldErrors.linkedin = 'Debe comenzar con http:// o https://';
    }
    
    setFieldErrors(newFieldErrors);
    
    if (errors.length > 0) {
      setError(
        <div>
          <strong>Por favor, corrija los siguientes errores:</strong>
          <ul className="mb-0 mt-2">
            {errors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      );
      return false;
    }
    
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Actualizar datos del usuario (name, email, password)
      const userUpdateData = {};
      if (formData.name !== originalData.name) userUpdateData.name = formData.name;
      if (formData.email !== originalData.email) userUpdateData.email = formData.email;
      if (formData.password) {
        userUpdateData.password = formData.password;
        userUpdateData.password_confirmation = formData.password_confirmation;
      }

      if (Object.keys(userUpdateData).length > 0) {
        const userResponse = await api.put('/user/profile', userUpdateData);
        // Actualizar context de usuario
        if (updateUserInfo) {
          updateUserInfo(userResponse.data.user);
        }
      }

      // Actualizar datos del candidato
      const candidatoFormData = new FormData();
      
      // Solo enviar campos que han cambiado
      if (formData.apellido !== originalData.apellido) candidatoFormData.append('apellido', formData.apellido);
      if (formData.telefono !== originalData.telefono) candidatoFormData.append('telefono', formData.telefono);
      if (formData.direccion !== originalData.direccion) candidatoFormData.append('direccion', formData.direccion);
      if (formData.bio !== originalData.bio) candidatoFormData.append('bio', formData.bio);
      if (formData.habilidades !== originalData.habilidades) candidatoFormData.append('habilidades', formData.habilidades);
      if (formData.linkedin !== originalData.linkedin) candidatoFormData.append('linkedin', formData.linkedin);
      if (formData.experiencia_resumida !== originalData.experiencia_resumida) candidatoFormData.append('experiencia_resumida', formData.experiencia_resumida);
      if (formData.educacion_resumida !== originalData.educacion_resumida) candidatoFormData.append('educacion_resumida', formData.educacion_resumida);
      
      // Archivos
      if (formData.avatar instanceof File) candidatoFormData.append('avatar', formData.avatar);
      if (formData.cv instanceof File) candidatoFormData.append('cv', formData.cv);

      // Solo hacer request de candidato si hay cambios
      if (candidatoFormData.entries().next().done === false) {
        await api.post(`/candidatos/${formData.candidatoId}?_method=PUT`, candidatoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(
        <div>
          <strong>¡Perfil actualizado exitosamente!</strong>
          <div className="mt-1 small">
            {Object.keys(userUpdateData).length > 0 && <div>• Datos de usuario actualizados</div>}
            {candidatoFormData.entries().next().done === false && <div>• Información profesional actualizada</div>}
            {formData.avatar instanceof File && <div>• Nueva foto de perfil guardada</div>}
            {formData.cv instanceof File && <div>• Nuevo CV cargado correctamente</div>}
          </div>
        </div>
      );
      setEditMode(false);
      setShowPasswordFields(false);
      setFieldErrors({});
      setTouchedFields({});
      
      // Recargar datos para obtener URLs actualizadas de archivos
      await reloadData();
      
      // Limpiar campos de contraseña
      setFormData(prev => ({
        ...prev,
        password: '',
        password_confirmation: ''
      }));
      
    } catch (err) {
      console.error('Error al guardar:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join('. '));
      } else {
        setError('Error al guardar los cambios: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setPreviewAvatar(originalData.avatar);
    setEditMode(false);
    setShowPasswordFields(false);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setTouchedFields({});
  };

  // Función para obtener clases CSS del campo según su estado
  const getFieldClasses = (fieldName) => {
    let classes = 'form-control';
    
    if (fieldErrors[fieldName] && touchedFields[fieldName]) {
      classes += ' is-invalid';
    } else if (touchedFields[fieldName] && !fieldErrors[fieldName] && formData[fieldName]) {
      classes += ' is-valid';
    }
    
    return classes;
  };

  const renderFieldFeedback = (fieldName) => {
    if (fieldErrors[`${fieldName}_success`]) {
      return (
        <div className="valid-feedback d-block">
          <i className="bi bi-check-circle me-1"></i>
          {fieldErrors[`${fieldName}_success`]}
        </div>
      );
    }
    
    if (fieldErrors[fieldName] && touchedFields[fieldName]) {
      return (
        <div className="invalid-feedback d-block">
          <i className="bi bi-exclamation-triangle me-1"></i>
          {fieldErrors[fieldName]}
        </div>
      );
    }
    
    // Mostrar ayuda para campos importantes cuando están vacíos en modo de visualización
    if (!editMode && !formData[fieldName] && ['bio', 'habilidades', 'experiencia_resumida'].includes(fieldName)) {
      return (
        <div className="text-muted small">
          <i className="bi bi-info-circle me-1"></i>
          Complete este campo para un perfil más atractivo
        </div>
      );
    }
    
    return null;
  };

  // Función para calcular completitud del perfil
  const calcularCompletitud = () => {
    const camposImportantes = ['name', 'apellido', 'telefono', 'bio', 'habilidades', 'experiencia_resumida', 'educacion_resumida'];
    const camposCompletos = camposImportantes.filter(campo => formData[campo]?.trim()).length;
    return Math.round((camposCompletos / camposImportantes.length) * 100);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4">
                
                {/* Header con avatar */}
                <div className="d-flex flex-column align-items-center mb-4">
                  <div className="position-relative mb-3" style={{ width: 120, height: 120 }}>
                    <div className="rounded-circle overflow-hidden border" style={{ width: 120, height: 120 }}>
                      {previewAvatar ? (
                        <img 
                          src={previewAvatar} 
                          alt="Avatar" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                          <i className="bi bi-person-circle text-muted" style={{ fontSize: '4rem' }}></i>
                        </div>
                      )}
                    </div>
                    {editMode && (
                      <div className="position-absolute bottom-0 end-0">
                        <label className="btn btn-sm btn-primary rounded-circle" style={{ width: 35, height: 35 }}>
                          <i className="bi bi-camera"></i>
                          <input 
                            type="file" 
                            name="avatar"
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="d-none"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <h3 className="fw-bold mb-1 text-primary">{formData.name} {formData.apellido}</h3>
                  <p className="text-muted mb-2">{formData.email}</p>
                  
                  {/* Barra de completitud del perfil - Solo para perfil propio */}
                  {isOwnProfile && (
                    <div className="w-100 mb-3" style={{ maxWidth: '300px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Completitud del perfil</small>
                        <small className="fw-bold text-primary">{calcularCompletitud()}%</small>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className={`progress-bar ${calcularCompletitud() >= 80 ? 'bg-success' : calcularCompletitud() >= 50 ? 'bg-warning' : 'bg-danger'}`}
                          role="progressbar" 
                          style={{ width: `${calcularCompletitud()}%` }}
                        ></div>
                      </div>
                      {calcularCompletitud() < 100 && (
                        <small className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Completa tu perfil para ser más visible
                        </small>
                      )}
                    </div>
                  )}
                </div>

                {/* Mensajes de estado */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError(null)}
                    ></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSuccess(null)}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    
                    {/* Datos personales */}
                    <div className="col-12">
                      <h5 className="text-primary mb-3">
                        <i className="bi bi-person me-2"></i>
                        Información Personal
                      </h5>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nombre *</label>
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
                      <label className="form-label fw-semibold">Apellido *</label>
                      <input 
                        type="text" 
                        name="apellido"
                        className={getFieldClasses('apellido')}
                        value={formData.apellido}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                      />
                      {renderFieldFeedback('apellido')}
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
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setShowPasswordFields(!showPasswordFields)}
                          >
                            {showPasswordFields ? 'Cancelar' : 'Cambiar'}
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

                    {/* Información profesional */}
                    <div className="col-12 mt-4">
                      <h5 className="text-primary mb-3">
                        <i className="bi bi-briefcase me-2"></i>
                        Información Profesional
                      </h5>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Biografía Profesional *</label>
                      <textarea 
                        name="bio"
                        className={getFieldClasses('bio')}
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Describe tu experiencia, objetivos y habilidades principales..."
                        maxLength={1000}
                        required
                      />
                      <div className="form-text text-end">
                        {formData.bio.length}/1000 caracteres
                      </div>
                      {renderFieldFeedback('bio')}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Experiencia Laboral *</label>
                      <textarea 
                        name="experiencia_resumida"
                        className={getFieldClasses('experiencia_resumida')}
                        rows={3}
                        value={formData.experiencia_resumida}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Ejemplo: Software Developer en TechCorp (2020-2023), Frontend Developer en StartupXYZ (2018-2020)..."
                        required
                      />
                      {renderFieldFeedback('experiencia_resumida')}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Educación *</label>
                      <textarea 
                        name="educacion_resumida"
                        className={getFieldClasses('educacion_resumida')}
                        rows={2}
                        value={formData.educacion_resumida}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Ejemplo: Licenciatura en Sistemas, Universidad XYZ (2015-2019)..."
                        required
                      />
                      {renderFieldFeedback('educacion_resumida')}
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Habilidades *</label>
                      <input 
                        type="text" 
                        name="habilidades"
                        className={getFieldClasses('habilidades')}
                        value={formData.habilidades}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Ejemplo: JavaScript, React, Laravel, MySQL, Git..."
                        required
                      />
                      {renderFieldFeedback('habilidades')}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">LinkedIn</label>
                      <input 
                        type="url" 
                        name="linkedin"
                        className={getFieldClasses('linkedin')}
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="https://linkedin.com/in/tu-perfil"
                      />
                      {renderFieldFeedback('linkedin')}
                    </div>

                    {/* Archivos */}
                    <div className="col-12 mt-4">
                      <h5 className="text-primary mb-3">
                        <i className="bi bi-file-earmark me-2"></i>
                        Documentos
                      </h5>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Curriculum Vitae (PDF)</label>
                      {editMode ? (
                        <>
                          <input 
                            type="file" 
                            name="cv"
                            className={getFieldClasses('cv')}
                            accept=".pdf"
                            onChange={handleFileChange}
                          />
                          {renderFieldFeedback('cv')}
                        </>
                      ) : (
                        <div className="form-control d-flex align-items-center justify-content-between">
                          {formData.cv ? (
                            <>
                              <span>
                                <i className="bi bi-file-pdf text-danger me-2"></i>
                                CV disponible ({formData.cv.includes('.pdf') ? 'PDF' : 'Archivo'})
                              </span>
                              <div className="btn-group">
                                <a 
                                  href={formData.cv.startsWith('http') ? formData.cv : `http://localhost:8000${formData.cv}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="bi bi-eye me-1"></i>Ver
                                </a>
                                <button
                                  type="button"
                                  onClick={handleDownloadCV}
                                  className="btn btn-sm btn-outline-success"
                                >
                                  <i className="bi bi-download me-1"></i>Descargar
                                </button>
                              </div>
                            </>
                          ) : (
                            <span className="text-muted">No hay CV cargado</span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Botones de acción - Solo para perfil propio */}
                  {isOwnProfile && (
                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                      {!editMode ? (
                        <button 
                          type="button" 
                          className="btn btn-primary px-4"
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
                          onClick={handleCancel}
                          disabled={saving}
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
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Guardando...</span>
                              </div>
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
                  )}
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
