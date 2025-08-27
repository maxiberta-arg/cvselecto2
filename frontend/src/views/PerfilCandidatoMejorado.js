import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PerfilCandidatoMejorado() {
  const { user, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

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
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
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
  }, [user?.id]);

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
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Validar tamaño de archivo
      if (name === 'avatar' && file.size > 2048 * 1024) { // 2MB
        setError('La imagen no puede superar los 2MB');
        return;
      }
      
      if (name === 'cv' && file.size > 5120 * 1024) { // 5MB
        setError('El CV no puede superar los 5MB');
        return;
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
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name?.trim()) {
      errors.push('El nombre es obligatorio');
    }
    
    if (!formData.email?.trim()) {
      errors.push('El email es obligatorio');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('El email no tiene un formato válido');
    }
    
    if (formData.password || formData.password_confirmation) {
      if (formData.password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
      }
      if (formData.password !== formData.password_confirmation) {
        errors.push('Las contraseñas no coinciden');
      }
    }
    
    if (formData.linkedin && !/^https?:\/\/.+/.test(formData.linkedin)) {
      errors.push('El enlace de LinkedIn debe ser una URL válida');
    }
    
    if (errors.length > 0) {
      setError(errors.join('. '));
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

      setSuccess('Perfil actualizado correctamente');
      setEditMode(false);
      setShowPasswordFields(false);
      
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
                  <h3 className="fw-bold mb-1 text-primary">{formData.name}</h3>
                  <p className="text-muted mb-0">{formData.email}</p>
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
                        className="form-control" 
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Apellido</label>
                      <input 
                        type="text" 
                        name="apellido"
                        className="form-control" 
                        value={formData.apellido}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email *</label>
                      <input 
                        type="email" 
                        name="email"
                        className="form-control" 
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Teléfono</label>
                      <input 
                        type="tel" 
                        name="telefono"
                        className="form-control" 
                        value={formData.telefono}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Dirección</label>
                      <input 
                        type="text" 
                        name="direccion"
                        className="form-control" 
                        value={formData.direccion}
                        onChange={handleInputChange}
                        disabled={!editMode}
                      />
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
                                className="form-control" 
                                value={formData.password}
                                onChange={handleInputChange}
                                minLength={8}
                                placeholder="Mínimo 8 caracteres"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Confirmar Contraseña</label>
                              <input 
                                type="password" 
                                name="password_confirmation"
                                className="form-control" 
                                value={formData.password_confirmation}
                                onChange={handleInputChange}
                                placeholder="Repetir contraseña"
                              />
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
                      <label className="form-label fw-semibold">Biografía Profesional</label>
                      <textarea 
                        name="bio"
                        className="form-control" 
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Describe tu experiencia, objetivos y habilidades principales..."
                        maxLength={1000}
                      />
                      <div className="form-text text-end">
                        {formData.bio.length}/1000 caracteres
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Experiencia Laboral</label>
                      <textarea 
                        name="experiencia_resumida"
                        className="form-control" 
                        rows={3}
                        value={formData.experiencia_resumida}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Ejemplo: Software Developer en TechCorp (2020-2023), Frontend Developer en StartupXYZ (2018-2020)..."
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Educación</label>
                      <textarea 
                        name="educacion_resumida"
                        className="form-control" 
                        rows={2}
                        value={formData.educacion_resumida}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Ejemplo: Licenciatura en Sistemas, Universidad XYZ (2015-2019)..."
                      />
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Habilidades</label>
                      <input 
                        type="text" 
                        name="habilidades"
                        className="form-control" 
                        value={formData.habilidades}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="Ejemplo: JavaScript, React, Laravel, MySQL, Git..."
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">LinkedIn</label>
                      <input 
                        type="url" 
                        name="linkedin"
                        className="form-control" 
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        placeholder="https://linkedin.com/in/tu-perfil"
                      />
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
                        <input 
                          type="file" 
                          name="cv"
                          className="form-control"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                      ) : (
                        <div className="form-control d-flex align-items-center justify-content-between">
                          {formData.cv ? (
                            <>
                              <span>
                                <i className="bi bi-file-pdf text-danger me-2"></i>
                                CV disponible
                              </span>
                              <a 
                                href={formData.cv} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                Ver
                              </a>
                            </>
                          ) : (
                            <span className="text-muted">No hay CV cargado</span>
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
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
