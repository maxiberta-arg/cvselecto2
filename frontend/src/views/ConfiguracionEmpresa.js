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

  // Configuración de cuenta
  const [configCuenta, setConfigCuenta] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    notificaciones_email: true,
    notificaciones_browser: true
  });

  // Configuración de empresa
  const [configEmpresa, setConfigEmpresa] = useState({
    razon_social: '',
    email_contacto: '',
    persona_contacto: '',
    telefono: '',
    sitio_web: '',
    linkedin_url: '',
    descripcion: '',
    sector: '',
    tamaño_empresa: ''
  });

  // Preferencias de búsquedas
  const [configBusquedas, setConfigBusquedas] = useState({
    auto_aprobar_postulaciones: false,
    limite_postulaciones_por_busqueda: 50,
    dias_expiracion_busquedas: 30,
    permitir_postulaciones_anonimas: false,
    filtro_automatico_cv: false,
    notificar_nuevas_postulaciones: true
  });

  useEffect(() => {
    cargarConfiguracion();
  }, [user?.id]);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del usuario
      if (user) {
        setConfigCuenta(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || ''
        }));
      }

      // Cargar datos de la empresa
      const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
      const empresa = empresaResponse.data;

      setConfigEmpresa({
        razon_social: empresa.razon_social || '',
        email_contacto: empresa.email_contacto || '',
        persona_contacto: empresa.persona_contacto || '',
        telefono: empresa.telefono || '',
        sitio_web: empresa.sitio_web || '',
        linkedin_url: empresa.linkedin_url || '',
        descripcion: empresa.descripcion || '',
        sector: empresa.sector || '',
        tamaño_empresa: empresa.tamaño_empresa || ''
      });

    } catch (err) {
      console.error('Error al cargar configuración:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const guardarCuenta = async () => {
    try {
      setSaving(true);
      setError(null);

      const dataToUpdate = {
        user_name: configCuenta.name,
        user_email: configCuenta.email
      };

      if (configCuenta.password) {
        if (configCuenta.password !== configCuenta.password_confirmation) {
          setError('Las contraseñas no coinciden');
          return;
        }
        dataToUpdate.password = configCuenta.password;
        dataToUpdate.password_confirmation = configCuenta.password_confirmation;
      }

      const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
      const empresa = empresaResponse.data;

      await api.put(`/empresas/${empresa.id}`, dataToUpdate);

      // Actualizar contexto de usuario si cambió email o nombre
      if (dataToUpdate.user_name || dataToUpdate.user_email) {
        updateUserInfo({
          ...user,
          name: dataToUpdate.user_name || user.name,
          email: dataToUpdate.user_email || user.email
        });
      }

      setSuccess('Configuración de cuenta actualizada correctamente');
      
      // Limpiar campos de contraseña
      setConfigCuenta(prev => ({
        ...prev,
        password: '',
        password_confirmation: ''
      }));

    } catch (err) {
      console.error('Error al guardar cuenta:', err);
      setError(err.response?.data?.message || 'Error al actualizar la configuración de cuenta');
    } finally {
      setSaving(false);
    }
  };

  const guardarEmpresa = async () => {
    try {
      setSaving(true);
      setError(null);

      const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
      const empresa = empresaResponse.data;

      await api.put(`/empresas/${empresa.id}`, configEmpresa);

      setSuccess('Configuración de empresa actualizada correctamente');

    } catch (err) {
      console.error('Error al guardar empresa:', err);
      setError(err.response?.data?.message || 'Error al actualizar la configuración de empresa');
    } finally {
      setSaving(false);
    }
  };

  const guardarPreferencias = async () => {
    try {
      setSaving(true);
      setError(null);

      // Simular guardado de preferencias (implementar cuando haya backend para esto)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Preferencias de búsquedas actualizadas correctamente');

    } catch (err) {
      console.error('Error al guardar preferencias:', err);
      setError('Error al actualizar las preferencias de búsquedas');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando configuración...</span>
          </div>
          <p className="mt-3 text-muted">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Configuración</h1>
          <p className="text-muted">Gestiona la configuración de tu cuenta y empresa</p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/empresa')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Dashboard
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'cuenta' ? 'active' : ''}`}
                onClick={() => setActiveTab('cuenta')}
              >
                <i className="bi bi-person-circle me-2"></i>
                Cuenta
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'empresa' ? 'active' : ''}`}
                onClick={() => setActiveTab('empresa')}
              >
                <i className="bi bi-building me-2"></i>
                Empresa
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'preferencias' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferencias')}
              >
                <i className="bi bi-gear me-2"></i>
                Preferencias
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* Tab Cuenta */}
          {activeTab === 'cuenta' && (
            <div>
              <h5 className="mb-3">Configuración de Cuenta</h5>
              <form onSubmit={(e) => { e.preventDefault(); guardarCuenta(); }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={configCuenta.name}
                      onChange={(e) => setConfigCuenta(prev => ({...prev, name: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={configCuenta.email}
                      onChange={(e) => setConfigCuenta(prev => ({...prev, email: e.target.value}))}
                      required
                    />
                  </div>
                </div>

                <hr className="my-4" />
                
                <h6 className="mb-3">Cambiar Contraseña</h6>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={configCuenta.password}
                      onChange={(e) => setConfigCuenta(prev => ({...prev, password: e.target.value}))}
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirmar Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={configCuenta.password_confirmation}
                      onChange={(e) => setConfigCuenta(prev => ({...prev, password_confirmation: e.target.value}))}
                      placeholder="Confirmar nueva contraseña"
                    />
                  </div>
                </div>

                <hr className="my-4" />

                <h6 className="mb-3">Notificaciones</h6>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={configCuenta.notificaciones_email}
                    onChange={(e) => setConfigCuenta(prev => ({...prev, notificaciones_email: e.target.checked}))}
                  />
                  <label className="form-check-label">
                    Recibir notificaciones por email
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={configCuenta.notificaciones_browser}
                    onChange={(e) => setConfigCuenta(prev => ({...prev, notificaciones_browser: e.target.checked}))}
                  />
                  <label className="form-check-label">
                    Mostrar notificaciones en el navegador
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check me-2"></i>
                      Guardar Cuenta
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tab Empresa */}
          {activeTab === 'empresa' && (
            <div>
              <h5 className="mb-3">Configuración de Empresa</h5>
              <form onSubmit={(e) => { e.preventDefault(); guardarEmpresa(); }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Razón Social *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={configEmpresa.razon_social}
                      onChange={(e) => setConfigEmpresa(prev => ({...prev, razon_social: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email de Contacto</label>
                    <input
                      type="email"
                      className="form-control"
                      value={configEmpresa.email_contacto}
                      onChange={(e) => setConfigEmpresa(prev => ({...prev, email_contacto: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Persona de Contacto</label>
                    <input
                      type="text"
                      className="form-control"
                      value={configEmpresa.persona_contacto}
                      onChange={(e) => setConfigEmpresa(prev => ({...prev, persona_contacto: e.target.value}))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={configEmpresa.telefono}
                      onChange={(e) => setConfigEmpresa(prev => ({...prev, telefono: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Sitio Web</label>
                    <input
                      type="url"
                      className="form-control"
                      value={configEmpresa.sitio_web}
                      onChange={(e) => setConfigEmpresa(prev => ({...prev, sitio_web: e.target.value}))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">LinkedIn</label>
                    <input
                      type="url"
                      className="form-control"
                      value={configEmpresa.linkedin_url}
                      onChange={(e) => setConfigEmpresa(prev => ({...prev, linkedin_url: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Sector</label>
                    <select
                      className="form-select"
                      value={configEmpresa.sector}
                      onChange={(e) => setConfigEmpresa(prev => ({...prev, sector: e.target.value}))}
                    >
                      <option value="">Seleccionar sector</option>
                      <option value="tecnologia">Tecnología</option>
                      <option value="finanzas">Finanzas</option>
                      <option value="salud">Salud</option>
                      <option value="educacion">Educación</option>
                      <option value="manufactura">Manufactura</option>
                      <option value="comercio">Comercio</option>
                      <option value="servicios">Servicios</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tamaño de la Empresa</label>
                    <select
                      className="form-select"
                      value={configEmpresa.tamaño_empresa}
                      onChange={(e) => setConfigEmpresa(prev => ({...prev, tamaño_empresa: e.target.value}))}
                    >
                      <option value="">Seleccionar tamaño</option>
                      <option value="1-10">1-10 empleados</option>
                      <option value="11-50">11-50 empleados</option>
                      <option value="51-200">51-200 empleados</option>
                      <option value="201-1000">201-1000 empleados</option>
                      <option value="1000+">Más de 1000 empleados</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={configEmpresa.descripcion}
                    onChange={(e) => setConfigEmpresa(prev => ({...prev, descripcion: e.target.value}))}
                    placeholder="Descripción de la empresa..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check me-2"></i>
                      Guardar Empresa
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tab Preferencias */}
          {activeTab === 'preferencias' && (
            <div>
              <h5 className="mb-3">Preferencias de Búsquedas</h5>
              <form onSubmit={(e) => { e.preventDefault(); guardarPreferencias(); }}>
                
                <h6 className="mb-3">Postulaciones</h6>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={configBusquedas.auto_aprobar_postulaciones}
                        onChange={(e) => setConfigBusquedas(prev => ({...prev, auto_aprobar_postulaciones: e.target.checked}))}
                      />
                      <label className="form-check-label">
                        Auto-aprobar postulaciones
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={configBusquedas.permitir_postulaciones_anonimas}
                        onChange={(e) => setConfigBusquedas(prev => ({...prev, permitir_postulaciones_anonimas: e.target.checked}))}
                      />
                      <label className="form-check-label">
                        Permitir postulaciones anónimas
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Límite de postulaciones por búsqueda</label>
                      <input
                        type="number"
                        className="form-control"
                        value={configBusquedas.limite_postulaciones_por_busqueda}
                        onChange={(e) => setConfigBusquedas(prev => ({...prev, limite_postulaciones_por_busqueda: parseInt(e.target.value)}))}
                        min="10"
                        max="500"
                      />
                    </div>
                  </div>
                </div>

                <h6 className="mb-3">Búsquedas</h6>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Días para expiración automática</label>
                      <input
                        type="number"
                        className="form-control"
                        value={configBusquedas.dias_expiracion_busquedas}
                        onChange={(e) => setConfigBusquedas(prev => ({...prev, dias_expiracion_busquedas: parseInt(e.target.value)}))}
                        min="7"
                        max="365"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mb-2 mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={configBusquedas.filtro_automatico_cv}
                        onChange={(e) => setConfigBusquedas(prev => ({...prev, filtro_automatico_cv: e.target.checked}))}
                      />
                      <label className="form-check-label">
                        Filtro automático de CVs por palabras clave
                      </label>
                    </div>
                  </div>
                </div>

                <h6 className="mb-3">Notificaciones</h6>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={configBusquedas.notificar_nuevas_postulaciones}
                    onChange={(e) => setConfigBusquedas(prev => ({...prev, notificar_nuevas_postulaciones: e.target.checked}))}
                  />
                  <label className="form-check-label">
                    Notificar nuevas postulaciones inmediatamente
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check me-2"></i>
                      Guardar Preferencias
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
