import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    // Datos de usuario
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    rol: 'candidato',
    
    // Datos específicos de candidato
    apellido: '',
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
    bio: '',
    habilidades: '',
    experiencia_resumida: '',
    educacion_resumida: '',
    nivel_educacion: '',
    experiencia_anos: '',
    disponibilidad: 'inmediata',
    modalidad_preferida: 'presencial',
    pretension_salarial: '',
    linkedin_url: '',
    portfolio_url: '',
    
    // Datos específicos de empresa
    razon_social: '',
    cuit: '',
    descripcion_empresa: '',
    sector: '',
    tamano_empresa: '',
    sitio_web: ''
  });
  
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // Función para obtener total de pasos
  const getTotalSteps = () => {
    return formData.rol === 'candidato' ? 3 : 2;
  };

  // Función para avanzar paso
  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  // Función para retroceder paso  
  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < getTotalSteps()) {
      // Avanzar al siguiente paso
      setStep(prev => prev + 1);
      return;
    }
    
    // Último paso - enviar formulario
    setLoading(true);
    setError('');

    // Validaciones básicas
    if (formData.password !== formData.password_confirmation) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    // Validaciones específicas por rol
    if (formData.rol === 'candidato' && !formData.apellido) {
      setError('El apellido es obligatorio para candidatos');
      setLoading(false);
      return;
    }

    if (formData.rol === 'empresa' && !formData.razon_social) {
      setError('La razón social es obligatoria para empresas');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        // Redireccionar según rol del usuario
        const userRole = result.user.rol;
        navigate(`/${userRole}`);
      } else {
        setError(result.error || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setError('Error de conexión con el servidor');
    }
    
    setLoading(false);
  };

  const renderProgressBar = () => {
    const totalSteps = getTotalSteps();
    const progress = (step / totalSteps) * 100;
    
    return (
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">Paso {step} de {totalSteps}</small>
          <small className="text-muted">{Math.round(progress)}% completado</small>
        </div>
        <div className="progress" style={{ height: '6px' }}>
          <div 
            className="progress-bar bg-primary" 
            role="progressbar" 
            style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
          ></div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <>
      {/* Selector de rol */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-person-badge me-2"></i>¿Cómo te registras?
        </label>
        <select
          className="form-select"
          name="rol"
          value={formData.rol}
          onChange={(e) => {
            handleChange(e);
            setStep(1); // Reset al cambiar rol
          }}
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
          required
        >
          <option value="candidato">👤 Candidato - Busco trabajo</option>
          <option value="empresa">🏢 Empresa - Busco candidatos</option>
        </select>
      </div>

      {/* Nombre */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-person me-2"></i>
          {formData.rol === 'candidato' ? 'Nombre completo' : 'Nombre de contacto'}
        </label>
        <input
          type="text"
          className="form-control"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={formData.rol === 'candidato' ? 'Tu nombre' : 'Nombre de la persona de contacto'}
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
          required
        />
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-envelope me-2"></i>Email
        </label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
          required
        />
      </div>

      {/* Contraseña */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-lock me-2"></i>Contraseña
        </label>
        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            style={{ borderRadius: '12px 0 0 12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
            required
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            style={{ borderRadius: '0 12px 12px 0', border: '2px solid #e3f2fd' }}
          >
            <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Confirmar contraseña */}
      <div className="mb-4">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-lock-fill me-2"></i>Confirmar contraseña
        </label>
        <div className="input-group">
          <input
            type={showPasswordConfirm ? 'text' : 'password'}
            className="form-control"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            placeholder="Repite tu contraseña"
            style={{ borderRadius: '12px 0 0 12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
            required
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            style={{ borderRadius: '0 12px 12px 0', border: '2px solid #e3f2fd' }}
          >
            <i className={`bi bi-eye${showPasswordConfirm ? '-slash' : ''}`}></i>
          </button>
        </div>
      </div>
    </>
  );

  const renderStep2Candidato = () => (
    <>
      <div className="text-center mb-4">
        <h5 className="text-primary mb-1">Información Personal</h5>
        <small className="text-muted">Datos básicos para tu perfil</small>
      </div>

      {/* Apellido */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-person me-2"></i>Apellido <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          placeholder="Tu apellido"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
          required
        />
      </div>

      {/* Fecha de nacimiento */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-calendar me-2"></i>Fecha de nacimiento
        </label>
        <input
          type="date"
          className="form-control"
          name="fecha_nacimiento"
          value={formData.fecha_nacimiento}
          onChange={handleChange}
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* Teléfono */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-telephone me-2"></i>Teléfono
        </label>
        <input
          type="tel"
          className="form-control"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="+54 11 1234-5678"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* Dirección */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-geo-alt me-2"></i>Dirección
        </label>
        <input
          type="text"
          className="form-control"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Tu dirección"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* Bio */}
      <div className="mb-4">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-chat-text me-2"></i>Biografía profesional
        </label>
        <textarea
          className="form-control"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="3"
          placeholder="Cuéntanos sobre ti, tus objetivos profesionales..."
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        ></textarea>
      </div>
    </>
  );

  const renderStep3Candidato = () => (
    <>
      <div className="text-center mb-4">
        <h5 className="text-primary mb-1">Experiencia Profesional</h5>
        <small className="text-muted">Información laboral y académica</small>
      </div>

      {/* Habilidades */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-gear me-2"></i>Habilidades principales
        </label>
        <input
          type="text"
          className="form-control"
          name="habilidades"
          value={formData.habilidades}
          onChange={handleChange}
          placeholder="JavaScript, Python, Marketing Digital, etc."
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* Nivel de educación */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-mortarboard me-2"></i>Nivel educativo
        </label>
        <select
          className="form-select"
          name="nivel_educacion"
          value={formData.nivel_educacion}
          onChange={handleChange}
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        >
          <option value="">Seleccionar nivel</option>
          <option value="secundario">Secundario</option>
          <option value="terciario">Terciario</option>
          <option value="universitario">Universitario</option>
          <option value="posgrado">Posgrado</option>
        </select>
      </div>

      {/* Años de experiencia */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-briefcase me-2"></i>Años de experiencia
        </label>
        <input
          type="number"
          className="form-control"
          name="experiencia_anos"
          value={formData.experiencia_anos}
          onChange={handleChange}
          min="0"
          max="50"
          placeholder="0"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* Disponibilidad */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-clock me-2"></i>Disponibilidad para iniciar
        </label>
        <select
          className="form-select"
          name="disponibilidad"
          value={formData.disponibilidad}
          onChange={handleChange}
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        >
          <option value="inmediata">Inmediata</option>
          <option value="1_semana">En 1 semana</option>
          <option value="15_dias">En 15 días</option>
          <option value="1_mes">En 1 mes</option>
          <option value="2_meses">En 2 meses</option>
        </select>
      </div>

      {/* Modalidad preferida */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-laptop me-2"></i>Modalidad de trabajo preferida
        </label>
        <select
          className="form-select"
          name="modalidad_preferida"
          value={formData.modalidad_preferida}
          onChange={handleChange}
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        >
          <option value="presencial">Presencial</option>
          <option value="remoto">Remoto</option>
          <option value="hibrido">Híbrido</option>
        </select>
      </div>

      {/* Pretensión salarial */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-currency-dollar me-2"></i>Pretensión salarial (ARS)
        </label>
        <input
          type="number"
          className="form-control"
          name="pretension_salarial"
          value={formData.pretension_salarial}
          onChange={handleChange}
          placeholder="500000"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* LinkedIn */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-linkedin me-2"></i>LinkedIn
        </label>
        <input
          type="url"
          className="form-control"
          name="linkedin_url"
          value={formData.linkedin_url}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/tu-perfil"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* Portfolio */}
      <div className="mb-4">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-globe me-2"></i>Portfolio/Sitio web
        </label>
        <input
          type="url"
          className="form-control"
          name="portfolio_url"
          value={formData.portfolio_url}
          onChange={handleChange}
          placeholder="https://tu-portfolio.com"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>
    </>
  );

  const renderStep2Empresa = () => (
    <>
      <div className="text-center mb-4">
        <h5 className="text-primary mb-1">Información de la Empresa</h5>
        <small className="text-muted">Datos corporativos</small>
      </div>

      {/* Razón social */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-building me-2"></i>Razón social <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          name="razon_social"
          value={formData.razon_social}
          onChange={handleChange}
          placeholder="Nombre oficial de la empresa"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
          required
        />
      </div>

      {/* CUIT */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-card-text me-2"></i>CUIT (opcional)
        </label>
        <input
          type="text"
          className="form-control"
          name="cuit"
          value={formData.cuit}
          onChange={handleChange}
          placeholder="XX-XXXXXXXX-X"
          pattern="[0-9]{2}-[0-9]{8}-[0-9]{1}"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
        <small className="text-muted">Formato: 30-12345678-9 (se puede completar después)</small>
      </div>

      {/* Teléfono */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-telephone me-2"></i>Teléfono de contacto
        </label>
        <input
          type="tel"
          className="form-control"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="+54 11 1234-5678"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* Dirección */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-geo-alt me-2"></i>Dirección
        </label>
        <input
          type="text"
          className="form-control"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Dirección de la empresa"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* Descripción */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-chat-text me-2"></i>Descripción de la empresa
        </label>
        <textarea
          className="form-control"
          name="descripcion_empresa"
          value={formData.descripcion_empresa}
          onChange={handleChange}
          rows="3"
          placeholder="Describe a qué se dedica tu empresa..."
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        ></textarea>
      </div>

      {/* Sector */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-diagram-3 me-2"></i>Sector
        </label>
        <input
          type="text"
          className="form-control"
          name="sector"
          value={formData.sector}
          onChange={handleChange}
          placeholder="Tecnología, Salud, Finanzas, etc."
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>

      {/* Tamaño de empresa */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-people me-2"></i>Tamaño de la empresa
        </label>
        <select
          className="form-select"
          name="tamano_empresa"
          value={formData.tamano_empresa}
          onChange={handleChange}
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        >
          <option value="">Seleccionar tamaño</option>
          <option value="5">Startup (1-10 empleados)</option>
          <option value="30">Pequeña (11-50 empleados)</option>
          <option value="125">Mediana (51-200 empleados)</option>
          <option value="600">Grande (201-1000 empleados)</option>
          <option value="2000">Corporativa (1000+ empleados)</option>
        </select>
      </div>

      {/* Sitio web */}
      <div className="mb-4">
        <label className="form-label fw-semibold" style={{ color: '#555' }}>
          <i className="bi bi-globe me-2"></i>Sitio web
        </label>
        <input
          type="url"
          className="form-control"
          name="sitio_web"
          value={formData.sitio_web}
          onChange={handleChange}
          placeholder="https://www.tuempresa.com"
          style={{ borderRadius: '12px', border: '2px solid #e3f2fd', background: '#fafbff' }}
        />
      </div>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e3f2fd 60%, #ede7f6 100%)', position: 'relative', overflow: 'hidden', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      {/* Fondo desenfocado decorativo */}
      <div style={{ position: 'absolute', top: '-120px', left: '-120px', width: '400px', height: '400px', background: 'radial-gradient(circle, #1976d2 0%, #ede7f6 80%)', filter: 'blur(60px)', opacity: 0.3, zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '400px', height: '400px', background: 'radial-gradient(circle, #512da8 0%, #ede7f6 80%)', filter: 'blur(60px)', opacity: 0.3, zIndex: 0 }}></div>
      
      <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', zIndex: 1 }}>
        <div className="card p-4 border-0" style={{ maxWidth: 480, width: '100%', borderRadius: '32px', boxShadow: '0 16px 64px 0 rgba(33, 150, 243, 0.22)', backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.98)', transition: 'box-shadow 0.3s' }}>
          
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mx-auto mb-3" style={{ width: 92, height: 92, transition: 'all 0.3s' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center w-100 h-100 animate__animated animate__fadeIn"
                style={{
                  background: 'linear-gradient(135deg, #1976d2 60%, #ede7f6 100%)',
                  boxShadow: '0 0 50px #1976d255, 0 8px 32px 0 rgba(33,150,243,0.13)',
                }}
              >
                <i className="bi bi-person-plus" style={{ fontSize: '2.2rem', color: 'white' }}></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1" style={{ color: '#1976d2', letterSpacing: '0.5px' }}>
              Crear Cuenta
            </h2>
            <p className="text-muted mb-0">Únete a CVSelecto</p>
          </div>

          {/* Barra de progreso */}
          {renderProgressBar()}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Renderizar paso actual */}
            {step === 1 && renderStep1()}
            {step === 2 && formData.rol === 'candidato' && renderStep2Candidato()}
            {step === 2 && formData.rol === 'empresa' && renderStep2Empresa()}
            {step === 3 && formData.rol === 'candidato' && renderStep3Candidato()}

            {/* Botones de navegación */}
            <div className="d-flex gap-2">
              {/* Botón anterior */}
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn btn-outline-secondary flex-fill"
                  style={{ borderRadius: '12px' }}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Anterior
                </button>
              )}

              {/* Botón siguiente/enviar */}
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-lg text-white fw-bold shadow-sm ${step > 1 ? 'flex-fill' : 'w-100'}`}
                style={{
                  background: loading ? '#ccc' : 'linear-gradient(90deg, #1976d2 60%, #8e24aa 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {step < getTotalSteps() ? 'Procesando...' : 'Creando cuenta...'}
                  </>
                ) : (
                  <>
                    {step < getTotalSteps() ? (
                      <>
                        Siguiente
                        <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Crear cuenta
                      </>
                    )}
                  </>
                )}
              </button>
            </div>

            {/* Link al login */}
            <div className="text-center mt-3">
              <p className="text-muted mb-0">
                ¿Ya tienes cuenta?{' '}
                <Link 
                  to="/login" 
                  className="text-decoration-none fw-semibold"
                  style={{ color: '#1976d2' }}
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
