import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './EditarCandidato.css';

const EditarCandidato = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
    bio: '',
    habilidades: '',
    linkedin_url: '',
    portfolio_url: '',
    experiencia_resumida: '',
    educacion_resumida: '',
    nivel_educacion: '',
    experiencia_anos: '',
    disponibilidad: 'inmediata',
    modalidad_preferida: 'presencial',
    pretension_salarial: '',
    avatar: null,
    cv: null
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [currentCV, setCurrentCV] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Opciones para selects
  const nivelesEducacion = [
    { value: '', label: 'Seleccionar nivel' },
    { value: 'secundario', label: 'Secundario' },
    { value: 'terciario', label: 'Terciario' },
    { value: 'universitario', label: 'Universitario' },
    { value: 'posgrado', label: 'Posgrado' }
  ];

  const disponibilidades = [
    { value: 'inmediata', label: 'Inmediata' },
    { value: '1_semana', label: '1 semana' },
    { value: '15_dias', label: '15 días' },
    { value: '1_mes', label: '1 mes' },
    { value: '2_meses', label: '2 meses' }
  ];

  const modalidades = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'remoto', label: 'Remoto' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  // Cargar datos del candidato
  useEffect(() => {
    const loadCandidato = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/candidatos/${id}`);
        const candidato = response.data;
        
        setFormData({
          nombre: candidato.nombre || '',
          apellido: candidato.apellido || '',
          email: candidato.email || candidato.user?.email || '',
          fecha_nacimiento: candidato.fecha_nacimiento || '',
          telefono: candidato.telefono || '',
          direccion: candidato.direccion || '',
          bio: candidato.bio || '',
          habilidades: candidato.habilidades || '',
          linkedin_url: candidato.linkedin_url || '',
          portfolio_url: candidato.portfolio_url || '',
          experiencia_resumida: candidato.experiencia_resumida || '',
          educacion_resumida: candidato.educacion_resumida || '',
          nivel_educacion: candidato.nivel_educacion || '',
          experiencia_anos: candidato.experiencia_anos || '',
          disponibilidad: candidato.disponibilidad || 'inmediata',
          modalidad_preferida: candidato.modalidad_preferida || 'presencial',
          pretension_salarial: candidato.pretension_salarial || '',
          avatar: null,
          cv: null
        });

        if (candidato.avatar) {
          // Construir la URL completa del avatar
          const avatarUrl = candidato.avatar.startsWith('http') ? candidato.avatar : `http://localhost:8000${candidato.avatar}`;
          setPreviewAvatar(avatarUrl);
        }

        // Verificar si tiene CV guardado
        if (candidato.cv_path) {
          setCurrentCV(candidato.cv_path);
        }

        console.log('Candidato loaded:', candidato);

      } catch (err) {
        console.error('Error loading candidato:', err);
        setError(err.message || 'Error al cargar los datos del candidato');
        toast.error(err.message || 'Error al cargar los datos del candidato');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCandidato();
    }
  }, [id]);

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Preview para avatar
      if (name === 'avatar' && file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewAvatar(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpiar error del campo si existe
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email no válido';
    }

    if (formData.fecha_nacimiento) {
      const birthDate = new Date(formData.fecha_nacimiento);
      const today = new Date();
      if (birthDate >= today) {
        errors.fecha_nacimiento = 'La fecha de nacimiento debe ser anterior a hoy';
      }
    }

    if (formData.experiencia_anos && (isNaN(formData.experiencia_anos) || formData.experiencia_anos < 0 || formData.experiencia_anos > 50)) {
      errors.experiencia_anos = 'Experiencia debe ser un número entre 0 y 50';
    }

    if (formData.pretension_salarial && (isNaN(formData.pretension_salarial) || formData.pretension_salarial < 0)) {
      errors.pretension_salarial = 'La pretensión salarial debe ser un número positivo';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const formDataToSend = new FormData();
      
      // Agregar todos los campos del formulario
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          // No agregar archivos vacíos
          if ((key === 'avatar' || key === 'cv') && !(formData[key] instanceof File)) {
            return;
          }
          formDataToSend.append(key, formData[key]);
        }
      });

      // Método PUT para actualización
      formDataToSend.append('_method', 'PUT');

      console.log('FormData being sent:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await api.post(`/candidatos/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Candidato actualizado correctamente');
      
      // Redirigir a la gestión de candidatos
      navigate('/gestion-candidatos');

    } catch (err) {
      console.error('Error updating candidato:', err);
      
      if (err.response?.status === 422) {
        console.error('Validation errors:', err.response.data);
        
        // Manejar errores específicos de validación
        if (err.response.data.errors) {
          const errorMessages = Object.entries(err.response.data.errors).map(([field, messages]) => {
            return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
          }).join('; ');
          
          setError('Errores de validación: ' + errorMessages);
          toast.error('Errores de validación: ' + errorMessages);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
          toast.error(err.response.data.message);
        } else {
          setError('Error de validación en el formulario');
          toast.error('Error de validación en el formulario');
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        setError(err.message || 'Error al actualizar el candidato');
        toast.error(err.message || 'Error al actualizar el candidato');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editar-candidato-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando datos del candidato...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.apellido) {
    return (
      <div className="editar-candidato-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/gestion-candidatos')}
          >
            Volver a Candidatos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-candidato-container">
      <div className="editar-candidato-header">
        <h2>Editar Candidato</h2>
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/gestion-candidatos')}
          disabled={saving}
        >
          Volver
        </button>
      </div>

      <form className="editar-candidato-form" onSubmit={handleSubmit}>
        {/* Información Personal */}
        <div className="form-section">
          <h3>Información Personal</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={fieldErrors.nombre ? 'error' : ''}
              />
              {fieldErrors.nombre && <span className="error-text">{fieldErrors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido *</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className={fieldErrors.apellido ? 'error' : ''}
                required
              />
              {fieldErrors.apellido && <span className="error-text">{fieldErrors.apellido}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={fieldErrors.email ? 'error' : ''}
              />
              {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                className={fieldErrors.fecha_nacimiento ? 'error' : ''}
              />
              {fieldErrors.fecha_nacimiento && <span className="error-text">{fieldErrors.fecha_nacimiento}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="text"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={fieldErrors.telefono ? 'error' : ''}
              />
              {fieldErrors.telefono && <span className="error-text">{fieldErrors.telefono}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className={fieldErrors.direccion ? 'error' : ''}
              />
              {fieldErrors.direccion && <span className="error-text">{fieldErrors.direccion}</span>}
            </div>
          </div>
        </div>

        {/* Información Profesional */}
        <div className="form-section">
          <h3>Información Profesional</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nivel_educacion">Nivel de Educación</label>
              <select
                id="nivel_educacion"
                name="nivel_educacion"
                value={formData.nivel_educacion}
                onChange={handleInputChange}
                className={fieldErrors.nivel_educacion ? 'error' : ''}
              >
                {nivelesEducacion.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldErrors.nivel_educacion && <span className="error-text">{fieldErrors.nivel_educacion}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="experiencia_anos">Años de Experiencia</label>
              <input
                type="number"
                id="experiencia_anos"
                name="experiencia_anos"
                value={formData.experiencia_anos}
                onChange={handleInputChange}
                min="0"
                max="50"
                className={fieldErrors.experiencia_anos ? 'error' : ''}
              />
              {fieldErrors.experiencia_anos && <span className="error-text">{fieldErrors.experiencia_anos}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="disponibilidad">Disponibilidad</label>
              <select
                id="disponibilidad"
                name="disponibilidad"
                value={formData.disponibilidad}
                onChange={handleInputChange}
                className={fieldErrors.disponibilidad ? 'error' : ''}
              >
                {disponibilidades.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldErrors.disponibilidad && <span className="error-text">{fieldErrors.disponibilidad}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="modalidad_preferida">Modalidad Preferida</label>
              <select
                id="modalidad_preferida"
                name="modalidad_preferida"
                value={formData.modalidad_preferida}
                onChange={handleInputChange}
                className={fieldErrors.modalidad_preferida ? 'error' : ''}
              >
                {modalidades.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldErrors.modalidad_preferida && <span className="error-text">{fieldErrors.modalidad_preferida}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pretension_salarial">Pretensión Salarial (ARS)</label>
            <input
              type="number"
              id="pretension_salarial"
              name="pretension_salarial"
              value={formData.pretension_salarial}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={fieldErrors.pretension_salarial ? 'error' : ''}
            />
            {fieldErrors.pretension_salarial && <span className="error-text">{fieldErrors.pretension_salarial}</span>}
          </div>
        </div>

        {/* Enlaces */}
        <div className="form-section">
          <h3>Enlaces Profesionales</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="linkedin_url">LinkedIn</label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/..."
                className={fieldErrors.linkedin_url ? 'error' : ''}
              />
              {fieldErrors.linkedin_url && <span className="error-text">{fieldErrors.linkedin_url}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="portfolio_url">Portfolio</label>
              <input
                type="url"
                id="portfolio_url"
                name="portfolio_url"
                value={formData.portfolio_url}
                onChange={handleInputChange}
                placeholder="https://..."
                className={fieldErrors.portfolio_url ? 'error' : ''}
              />
              {fieldErrors.portfolio_url && <span className="error-text">{fieldErrors.portfolio_url}</span>}
            </div>
          </div>
        </div>

        {/* Información Detallada */}
        <div className="form-section">
          <h3>Información Detallada</h3>
          
          <div className="form-group">
            <label htmlFor="bio">Biografía</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              maxLength="1000"
              className={fieldErrors.bio ? 'error' : ''}
            />
            <small>{formData.bio.length}/1000 caracteres</small>
            {fieldErrors.bio && <span className="error-text">{fieldErrors.bio}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="habilidades">Habilidades</label>
            <textarea
              id="habilidades"
              name="habilidades"
              value={formData.habilidades}
              onChange={handleInputChange}
              rows="3"
              maxLength="500"
              placeholder="Separar habilidades con comas"
              className={fieldErrors.habilidades ? 'error' : ''}
            />
            <small>{formData.habilidades.length}/500 caracteres</small>
            {fieldErrors.habilidades && <span className="error-text">{fieldErrors.habilidades}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experiencia_resumida">Experiencia (Resumen)</label>
              <textarea
                id="experiencia_resumida"
                name="experiencia_resumida"
                value={formData.experiencia_resumida}
                onChange={handleInputChange}
                rows="4"
                maxLength="1000"
                className={fieldErrors.experiencia_resumida ? 'error' : ''}
              />
              <small>{formData.experiencia_resumida.length}/1000 caracteres</small>
              {fieldErrors.experiencia_resumida && <span className="error-text">{fieldErrors.experiencia_resumida}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="educacion_resumida">Educación (Resumen)</label>
              <textarea
                id="educacion_resumida"
                name="educacion_resumida"
                value={formData.educacion_resumida}
                onChange={handleInputChange}
                rows="4"
                maxLength="1000"
                className={fieldErrors.educacion_resumida ? 'error' : ''}
              />
              <small>{formData.educacion_resumida.length}/1000 caracteres</small>
              {fieldErrors.educacion_resumida && <span className="error-text">{fieldErrors.educacion_resumida}</span>}
            </div>
          </div>
        </div>

        {/* Archivos */}
        <div className="form-section">
          <h3>Archivos</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="avatar">Avatar</label>
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                onChange={handleInputChange}
                className={fieldErrors.avatar ? 'error' : ''}
              />
              {previewAvatar && (
                <div className="avatar-preview">
                  <img src={previewAvatar} alt="Preview" width="100" />
                </div>
              )}
              <small>Formatos: JPEG, PNG, JPG, GIF. Máximo: 2MB</small>
              {fieldErrors.avatar && <span className="error-text">{fieldErrors.avatar}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cv">CV (PDF)</label>
              {currentCV && (
                <div className="current-cv">
                  <p>CV actual: <strong>{currentCV.split('/').pop()}</strong></p>
                  <a href={`http://localhost:8000${currentCV}`} target="_blank" rel="noopener noreferrer" className="cv-link">
                    📄 Ver/Descargar CV
                  </a>
                  <br />
                  <small>Selecciona un archivo para reemplazar el CV actual</small>
                </div>
              )}
              <input
                type="file"
                id="cv"
                name="cv"
                accept=".pdf"
                onChange={handleInputChange}
                className={fieldErrors.cv ? 'error' : ''}
              />
              <small>Formato: PDF. Máximo: 5MB</small>
              {fieldErrors.cv && <span className="error-text">{fieldErrors.cv}</span>}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate('/gestion-candidatos')}
            disabled={saving}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarCandidato;
