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
      
      setEmpresaId(empresa.id);

      const initialData = {
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
        empleados_cantidad: empresa.empleados_cantidad || '',
        sitio_web: empresa.sitio_web || '',
        linkedin_url: empresa.linkedin_url || '',
        logo: empresa.logo || null,
      };

      setFormData(initialData);
      setOriginalData({ ...initialData });
      
    } catch (err) {
      console.error('Error al cargar configuración:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    let newValue = value;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file' && files && files[0]) {
      const file = files[0];
      
      if (name === 'logo') {
        if (file.size > 2048 * 1024) {
          setFieldErrors(prev => ({ ...prev, [name]: 'El logo no puede superar los 2MB' }));
          return;
        }
        if (!file.type.startsWith('image/')) {
          setFieldErrors(prev => ({ ...prev, [name]: 'Solo se permiten archivos de imagen' }));
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => setPreviewLogo(e.target.result);
        reader.readAsDataURL(file);
      }
      
      newValue = file;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formDataToSend = new FormData();
      
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
      
      // Datos de la empresa
      if (formData.razon_social) formDataToSend.append('razon_social', formData.razon_social.trim());
      if (formData.cuit) formDataToSend.append('cuit', formData.cuit.replace(/\s/g, '').replace(/-/g, ''));
      if (formData.telefono) formDataToSend.append('telefono', formData.telefono.trim());
      if (formData.direccion) formDataToSend.append('direccion', formData.direccion.trim());
      if (formData.descripcion) formDataToSend.append('descripcion', formData.descripcion.trim());
      
      if (formData.sector && formData.sector.trim()) {
        formDataToSend.append('sector', formData.sector.trim());
      }
      if (formData.empleados_cantidad && formData.empleados_cantidad.toString().trim()) {
        // Enviar como número entero
        const empleados = parseInt(formData.empleados_cantidad, 10);
        if (!isNaN(empleados) && empleados > 0) {
          formDataToSend.append('empleados_cantidad', empleados);
        }
      }
      if (formData.sitio_web && formData.sitio_web.trim()) {
        formDataToSend.append('sitio_web', formData.sitio_web.trim());
      }
      if (formData.linkedin_url && formData.linkedin_url.trim()) {
        formDataToSend.append('linkedin_url', formData.linkedin_url.trim());
      }
      
      if (formData.logo && typeof formData.logo === 'object') {
        formDataToSend.append('logo', formData.logo);
      }
      
      const response = await api.post(`/empresas/${empresaId}?_method=PUT`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
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
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
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
                          className="form-control"
                          value={formData.password}
                          onChange={handleInputChange}
                          minLength="8"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Confirmar Contraseña</label>
                        <input
                          type="password"
                          name="password_confirmation"
                          className="form-control"
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                        />
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
                        className="form-control"
                        value={formData.razon_social}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">CUIT</label>
                      <input
                        type="text"
                        name="cuit"
                        className="form-control"
                        value={formData.cuit}
                        onChange={handleInputChange}
                        placeholder="20-12345678-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        className="form-control"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Sector</label>
                      <select
                        name="sector"
                        className="form-select"
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
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      className="form-control"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descripción de la Empresa</label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      rows="4"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Describe tu empresa, sus actividades y valores..."
                      required
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Sitio Web</label>
                      <input
                        type="url"
                        name="sitio_web"
                        className="form-control"
                        value={formData.sitio_web}
                        onChange={handleInputChange}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">LinkedIn</label>
                      <input
                        type="url"
                        name="linkedin_url"
                        className="form-control"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Cantidad de Empleados</label>
                    <select
                      name="empleados_cantidad"
                      className="form-select"
                      value={formData.empleados_cantidad}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar tamaño</option>
                      <option value="5">1-10 empleados</option>
                      <option value="30">11-50 empleados</option>
                      <option value="125">51-200 empleados</option>
                      <option value="500">201-1000 empleados</option>
                      <option value="2000">Más de 1000 empleados</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Logo de la Empresa</label>
                    <input
                      type="file"
                      name="logo"
                      className="form-control"
                      onChange={handleInputChange}
                      accept="image/*"
                    />
                    <div className="form-text">Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 2MB</div>
                    {previewLogo && (
                      <div className="mt-2">
                        <img src={previewLogo} alt="Preview" className="img-thumbnail" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      </div>
                    )}
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
  );
}
