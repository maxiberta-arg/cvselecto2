import React, { useState } from 'react';
import api from '../services/api';

const EmpresaForm = ({ empresaId, initialData = {} }) => {
  const [formData, setFormData] = useState({
    razon_social: initialData.razon_social || '',
    cuit: initialData.cuit || '',
    telefono: initialData.telefono || '',
    direccion: initialData.direccion || '',
    descripcion: initialData.descripcion || '',
    sector: initialData.sector || '',
    // campos opcionales
    tamaño_empresa: initialData.tamaño_empresa || '',
    año_fundacion: initialData.año_fundacion || '',
    email_contacto: initialData.email_contacto || '',
    persona_contacto: initialData.persona_contacto || '',
    sitio_web: initialData.sitio_web || '',
    linkedin_url: initialData.linkedin_url || '',
    logo: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Validación frontend
  const validateForm = () => {
    const newErrors = {};

    // Validar razón social
    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es obligatoria';
    } else if (formData.razon_social.length < 3) {
      newErrors.razon_social = 'La razón social debe tener al menos 3 caracteres';
    } else if (formData.razon_social.length > 255) {
      newErrors.razon_social = 'La razón social no puede superar los 255 caracteres';
    }

    // Validar CUIT si está presente
    if (formData.cuit && !/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
      newErrors.cuit = 'El CUIT debe tener el formato XX-XXXXXXXX-X';
    }

    // Validar descripción si está presente
    if (formData.descripcion && formData.descripcion.length > 0 && formData.descripcion.length < 50) {
      newErrors.descripcion = 'La descripción debe tener al menos 50 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const submitData = new FormData();
      
      // Agregar todos los campos del formulario
      Object.keys(formData).forEach(key => {
        if (key === 'logo' && formData[key] instanceof File) {
          submitData.append('logo', formData[key]);
        } else if (formData[key] !== '' && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      console.log('Enviando datos:', Object.fromEntries(submitData.entries()));

      const response = await api.post(`/empresas/${empresaId}?_method=PUT`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('✅ Empresa actualizada correctamente');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setErrors({ general: 'Error al actualizar la empresa' });
      }

    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      
      if (error.response?.status === 422) {
        // Errores de validación del servidor
        const serverErrors = error.response.data.errors || {};
        setErrors(serverErrors);
      } else if (error.response?.status === 404) {
        setErrors({ general: 'Empresa no encontrada' });
      } else {
        setErrors({ general: 'Error interno del servidor' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Editar Empresa</h2>
      
      {success && (
        <div className="alert alert-success">{success}</div>
      )}
      
      {errors.general && (
        <div className="alert alert-danger">{errors.general}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Razón Social - Campo obligatorio */}
        <div className="mb-3">
          <label htmlFor="razon_social" className="form-label">
            Razón Social <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.razon_social ? 'is-invalid' : ''}`}
            id="razon_social"
            name="razon_social"
            value={formData.razon_social}
            onChange={handleInputChange}
            required
          />
          {errors.razon_social && (
            <div className="invalid-feedback">{errors.razon_social}</div>
          )}
        </div>

        {/* CUIT */}
        <div className="mb-3">
          <label htmlFor="cuit" className="form-label">CUIT</label>
          <input
            type="text"
            className={`form-control ${errors.cuit ? 'is-invalid' : ''}`}
            id="cuit"
            name="cuit"
            value={formData.cuit}
            onChange={handleInputChange}
            placeholder="XX-XXXXXXXX-X"
          />
          {errors.cuit && (
            <div className="invalid-feedback">{errors.cuit}</div>
          )}
        </div>

        {/* Teléfono */}
        <div className="mb-3">
          <label htmlFor="telefono" className="form-label">Teléfono</label>
          <input
            type="text"
            className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
          />
          {errors.telefono && (
            <div className="invalid-feedback">{errors.telefono}</div>
          )}
        </div>

        {/* Dirección */}
        <div className="mb-3">
          <label htmlFor="direccion" className="form-label">Dirección</label>
          <input
            type="text"
            className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
          />
          {errors.direccion && (
            <div className="invalid-feedback">{errors.direccion}</div>
          )}
        </div>

        {/* Descripción */}
        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <textarea
            className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
            id="descripcion"
            name="descripcion"
            rows="4"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Describe tu empresa (mínimo 50 caracteres)"
          />
          {errors.descripcion && (
            <div className="invalid-feedback">{errors.descripcion}</div>
          )}
        </div>

        {/* Sector */}
        <div className="mb-3">
          <label htmlFor="sector" className="form-label">Sector</label>
          <input
            type="text"
            className={`form-control ${errors.sector ? 'is-invalid' : ''}`}
            id="sector"
            name="sector"
            value={formData.sector}
            onChange={handleInputChange}
          />
          {errors.sector && (
            <div className="invalid-feedback">{errors.sector}</div>
          )}
        </div>

        {/* Logo */}
        <div className="mb-3">
          <label htmlFor="logo" className="form-label">Logo</label>
          <input
            type="file"
            className={`form-control ${errors.logo ? 'is-invalid' : ''}`}
            id="logo"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
          />
          {errors.logo && (
            <div className="invalid-feedback">{errors.logo}</div>
          )}
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Actualizar Empresa'}
          </button>
          
          <button type="button" className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4">
          <h5>Debug Info:</h5>
          <pre>{JSON.stringify({ formData, errors }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default EmpresaForm;
