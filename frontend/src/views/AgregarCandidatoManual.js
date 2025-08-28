import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AgregarCandidatoManual() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { busquedaId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [empresaData, setEmpresaData] = useState(null);
  const [busquedaData, setBusquedaData] = useState(null);
  
  // Estados para el flujo de trabajo
  const [modoOperacion, setModoOperacion] = useState('buscar'); // 'buscar', 'crear', 'confirmar'
  const [candidatosEncontrados, setCandidatosEncontrados] = useState([]);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Formulario para nuevo candidato
  const [formDataCandidato, setFormDataCandidato] = useState({
    name: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    nivel_educacion: '',
    experiencia_anos: '',
    cv_path: null,
    linkedin_url: '',
    portfolio_url: '',
    disponibilidad: 'inmediata',
    pretension_salarial: '',
    modalidad_preferida: 'presencial'
  });

  // Formulario para la postulación
  const [formDataPostulacion, setFormDataPostulacion] = useState({
    estado: 'postulado',
    notas_empresa: '',
    puntuacion: ''
  });

  // Función para cargar todos los candidatos
  const cargarTodosCandidatos = async () => {
    try {
      setSearching(true);
      console.log('👥 Cargando todos los candidatos disponibles...');
      console.log('🌐 URL de API:', `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/candidatos`);
      
      const response = await api.get('/candidatos');
      const candidatos = response.data;
      
      console.log('📋 Total de candidatos encontrados:', candidatos.length);
      console.log('🔍 Primeros candidatos:', candidatos.slice(0, 3));
      setCandidatosEncontrados(candidatos);
      
    } catch (err) {
      console.error('❌ Error al cargar candidatos:', err);
      console.error('❌ Detalles del error:', err.response?.data || err.message);
      setCandidatosEncontrados([]);
    } finally {
      setSearching(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || !busquedaId) {
        console.log('⚠️ Faltan datos del usuario o busquedaId:', { userId: user?.id, busquedaId });
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('📋 Cargando datos para busqueda ID:', busquedaId);
        
        // Cargar datos de la empresa
        const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
        const empresa = empresaResponse.data;
        setEmpresaData(empresa);
        
        // Cargar datos de la búsqueda específica
        const busquedaResponse = await api.get(`/busquedas-laborales/${busquedaId}`);
        const busqueda = busquedaResponse.data;
        
        console.log('🏢 Empresa:', empresa.razon_social);
        console.log('📋 Búsqueda:', busqueda.titulo);
        
        // Verificar que la búsqueda pertenece a la empresa del usuario
        if (parseInt(busqueda.empresa_id) !== parseInt(empresa.id)) {
          throw new Error('No tienes permisos para agregar candidatos a esta búsqueda');
        }
        
        setBusquedaData(busqueda);
        
        console.log('✅ Datos básicos cargados, ahora cargando candidatos...');
        
      } catch (err) {
        console.error('❌ Error al cargar datos básicos:', err);
        if (err.response?.status === 404) {
          setError('No se encontró la búsqueda laboral solicitada.');
          setTimeout(() => navigate('/mis-busquedas-laborales'), 3000);
        } else if (err.response?.status === 403 || err.message.includes('permisos')) {
          setError('No tienes permisos para agregar candidatos a esta búsqueda.');
          setTimeout(() => navigate('/mis-busquedas-laborales'), 3000);
        } else {
          setError(`Error al cargar los datos: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, busquedaId, navigate]);

  // Cargar candidatos cuando los datos básicos estén listos
  useEffect(() => {
    if (!loading && !error) {
      console.log('🚀 Iniciando carga de candidatos...');
      cargarTodosCandidatos().then(() => {
        console.log('✅ Carga de candidatos completada');
      });
    }
  }, [loading, error]);

  // Función para buscar candidatos existentes
  const buscarCandidatos = async (termino) => {
    try {
      setSearching(true);
      
      if (!termino.trim()) {
        // Si no hay término de búsqueda, mostrar todos los candidatos
        console.log('👥 Mostrando todos los candidatos disponibles...');
        await cargarTodosCandidatos();
        return;
      }

      console.log('🔍 Buscando candidatos con término:', termino);
      
      const response = await api.get(`/candidatos?search=${encodeURIComponent(termino)}`);
      const candidatos = response.data;
      
      console.log('👥 Candidatos encontrados:', candidatos.length);
      setCandidatosEncontrados(candidatos);
      
    } catch (err) {
      console.error('❌ Error al buscar candidatos:', err);
      setCandidatosEncontrados([]);
    } finally {
      setSearching(false);
    }
  };

  // Función para manejar búsqueda en tiempo real
  const handleBusquedaChange = (e) => {
    const valor = e.target.value;
    setTerminoBusqueda(valor);
    
    // Debounce la búsqueda
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      buscarCandidatos(valor);
    }, 300);
  };

  // Función para seleccionar candidato existente
  const seleccionarCandidato = (candidato) => {
    setCandidatoSeleccionado(candidato);
    setModoOperacion('confirmar');
  };

  // Función para manejar cambios en formulario de candidato
  const handleCandidatoChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setFormDataCandidato(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));

    // Marcar campo como tocado
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    // Limpiar errores
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Función para manejar cambios en formulario de postulación
  const handlePostulacionChange = (e) => {
    const { name, value } = e.target;
    setFormDataPostulacion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validación del formulario de candidato
  const validateCandidatoForm = () => {
    const errors = {};

    if (!formDataCandidato.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    } else if (formDataCandidato.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formDataCandidato.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formDataCandidato.email)) {
      errors.email = 'El email debe tener un formato válido';
    }

    if (formDataCandidato.telefono && !/^[\+]?[\d\s\-\(\)]{8,}$/.test(formDataCandidato.telefono)) {
      errors.telefono = 'El teléfono debe tener un formato válido';
    }

    if (formDataCandidato.linkedin_url && !formDataCandidato.linkedin_url.includes('linkedin.com')) {
      errors.linkedin_url = 'La URL de LinkedIn debe ser válida';
    }

    if (formDataCandidato.experiencia_anos && (isNaN(formDataCandidato.experiencia_anos) || formDataCandidato.experiencia_anos < 0)) {
      errors.experiencia_anos = 'Los años de experiencia deben ser un número válido';
    }

    return errors;
  };

  // Función para crear nuevo candidato y postulación
  const crearCandidatoYPostulacion = async () => {
    // Validar formulario
    const errors = validateCandidatoForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      // Preparar datos del candidato
      const candidatoData = new FormData();
      Object.keys(formDataCandidato).forEach(key => {
        if (formDataCandidato[key] !== null && formDataCandidato[key] !== '') {
          candidatoData.append(key, formDataCandidato[key]);
        }
      });

      console.log('👤 Creando nuevo candidato...');
      
      // Crear candidato
      const candidatoResponse = await api.post('/candidatos', candidatoData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const nuevoCandidato = candidatoResponse.data;
      console.log('✅ Candidato creado:', nuevoCandidato);
      
      // Crear postulación
      await crearPostulacion(nuevoCandidato.id);
      
    } catch (err) {
      console.error('❌ Error al crear candidato:', err);
      
      if (err.response?.status === 422) {
        const backendErrors = err.response.data.errors || {};
        setFieldErrors(backendErrors);
        setError('Por favor corrige los errores de validación');
      } else if (err.response?.status === 409) {
        // Candidato duplicado - ofrecer opción de usar el existente
        const responseData = err.response.data;
        console.log('👤 Candidato duplicado detectado:', responseData);
        
        if (responseData.candidate_id) {
          const confirmarUso = window.confirm(
            `Ya existe un candidato con el email "${formDataCandidato.email}".\n\n` +
            `¿Deseas usar el candidato existente para esta postulación?\n\n` +
            `• SÍ: Se creará la postulación con el candidato existente\n` +
            `• NO: Puedes buscar y seleccionar otro candidato o cambiar el email`
          );
          
          if (confirmarUso) {
            try {
              console.log('🔄 Usando candidato existente:', responseData.candidate_id);
              await crearPostulacion(responseData.candidate_id);
              return; // Salir exitosamente
            } catch (postulacionErr) {
              console.error('❌ Error al crear postulación con candidato existente:', postulacionErr);
              setError('Error al crear la postulación con el candidato existente');
            }
          } else {
            setError('Email duplicado. Por favor, cambia el email o usa la búsqueda para encontrar el candidato existente.');
          }
        } else {
          setError('Ya existe un candidato con este email. Usa la búsqueda para encontrarlo.');
        }
      } else {
        setError(err.response?.data?.message || 'Error al crear el candidato');
      }
    } finally {
      setSaving(false);
    }
  };

  // Función para crear postulación (candidato existente o nuevo)
  const crearPostulacion = async (candidatoId) => {
    try {
      const postulacionData = {
        busqueda_id: parseInt(busquedaId),
        candidato_id: candidatoId,
        ...formDataPostulacion
      };

      console.log('📝 Creando postulación:', postulacionData);
      
      const response = await api.post('/postulaciones', postulacionData);
      
      console.log('✅ Postulación creada:', response.data);
      
      setSuccess('¡Candidato agregado exitosamente a la búsqueda laboral!');
      
      // Redirect después del éxito
      setTimeout(() => {
        navigate(`/busqueda-detalle/${busquedaId}`);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error al crear postulación:', err);
      
      if (err.response?.status === 409) {
        setError('Este candidato ya está postulado para esta búsqueda laboral.');
      } else {
        setError(err.response?.data?.message || 'Error al crear la postulación');
      }
      throw err; // Re-throw para que el catch del candidato lo maneje
    }
  };

  // Función para confirmar candidato existente
  const confirmarCandidatoExistente = async () => {
    if (!candidatoSeleccionado) return;

    setSaving(true);
    try {
      await crearPostulacion(candidatoSeleccionado.id);
    } catch (err) {
      // Error ya manejado en crearPostulacion
    } finally {
      setSaving(false);
    }
  };

  // Funciones de navegación
  const handleCancel = () => {
    navigate(`/mis-busquedas-laborales`);
  };

  const volverABusqueda = () => {
    setModoOperacion('buscar');
    setCandidatoSeleccionado(null);
  };

  const irACrearNuevo = () => {
    setModoOperacion('crear');
    setCandidatosEncontrados([]);
    setTerminoBusqueda('');
  };

  // Función para obtener clase CSS de campos
  const getFieldClass = (fieldName) => {
    const hasError = fieldErrors[fieldName];
    const wasTouched = touchedFields[fieldName];
    
    let baseClass = 'form-control';
    
    if (wasTouched) {
      baseClass += hasError ? ' is-invalid' : ' is-valid';
    }
    
    return baseClass;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                <div className="card-body text-center p-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <h5>Cargando datos de la búsqueda laboral...</h5>
                  <p className="text-muted">Verificando permisos y preparando formulario...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10">
            
            {/* Header dinámico según modo */}
            <div className="card shadow-lg border-0 mb-4" style={{ 
              borderRadius: '20px', 
              background: modoOperacion === 'buscar' 
                ? 'linear-gradient(135deg, #2e7d32 60%, #66bb6a 100%)'
                : modoOperacion === 'crear'
                ? 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)'
                : 'linear-gradient(135deg, #ed6c02 60%, #ff9800 100%)'
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)' }}>
                    <i className={`text-white ${
                      modoOperacion === 'buscar' ? 'bi bi-search' :
                      modoOperacion === 'crear' ? 'bi bi-person-plus' : 'bi bi-check-circle'
                    }`} style={{ fontSize: '1.8rem' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="fw-bold text-white mb-1">
                      {modoOperacion === 'buscar' && 'Buscar Candidato Existente'}
                      {modoOperacion === 'crear' && 'Crear Nuevo Candidato'}
                      {modoOperacion === 'confirmar' && 'Confirmar Candidato'}
                    </h3>
                    <p className="text-white-50 mb-0">
                      {busquedaData && empresaData && (
                        <>
                          {empresaData.razon_social} • {busquedaData.titulo}
                          {modoOperacion === 'confirmar' && candidatoSeleccionado && 
                            ` • ${candidatoSeleccionado.name}`
                          }
                        </>
                      )}
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-light btn-sm"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Volver
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes de estado */}
            {error && (
              <div className="alert alert-danger shadow-sm mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success shadow-sm mb-4" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {success}
              </div>
            )}

            {/* Navegación de pasos */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body p-3">
                <div className="row text-center">
                  <div className="col-md-4">
                    <div className={`p-3 rounded ${modoOperacion === 'buscar' ? 'bg-success text-white' : 'bg-light text-muted'}`}>
                      <i className="bi bi-search d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                      <span className="fw-semibold">1. Buscar Existente</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={`p-3 rounded ${modoOperacion === 'crear' ? 'bg-primary text-white' : 'bg-light text-muted'}`}>
                      <i className="bi bi-person-plus d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                      <span className="fw-semibold">2. Crear Nuevo</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={`p-3 rounded ${modoOperacion === 'confirmar' ? 'bg-warning text-dark' : 'bg-light text-muted'}`}>
                      <i className="bi bi-check-circle d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                      <span className="fw-semibold">3. Confirmar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido según modo de operación */}
            {modoOperacion === 'buscar' && (
              <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h5 className="fw-bold text-success mb-3">
                      <i className="bi bi-search me-2"></i>
                      Buscar Candidato Existente
                    </h5>
                    <p className="text-muted">
                      Se muestran todos los candidatos disponibles. Puedes filtrar por nombre, email o teléfono
                    </p>
                  </div>

                  {/* Buscador */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Buscar candidato:</label>
                      
                      <div className="input-group input-group-lg">
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nombre, email o teléfono del candidato..."
                          value={terminoBusqueda}
                          onChange={handleBusquedaChange}
                          disabled={saving}
                        />
                        {searching && (
                          <span className="input-group-text">
                            <span className="spinner-border spinner-border-sm"></span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resultados de búsqueda y lista de candidatos */}
                  <div className="mb-4">
                    {candidatosEncontrados.length > 0 ? (
                        <div>
                          <h6 className="fw-semibold text-success mb-3">
                            <i className="bi bi-people me-2"></i>
                            {terminoBusqueda.trim() ? 
                              `${candidatosEncontrados.length} candidato(s) encontrado(s):` :
                              `${candidatosEncontrados.length} candidato(s) disponible(s):`
                            }
                          </h6>
                          <div className="row g-3">
                            {candidatosEncontrados.map(candidato => (
                              <div key={candidato.id} className="col-md-6">
                                <div className="card border shadow-sm h-100">
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <h6 className="fw-bold text-primary mb-1">{candidato.name}</h6>
                                      <span className="badge bg-success">Encontrado</span>
                                    </div>
                                    <p className="text-muted mb-2">
                                      <i className="bi bi-envelope me-1"></i>
                                      {candidato.email}
                                    </p>
                                    {candidato.telefono && (
                                      <p className="text-muted mb-2">
                                        <i className="bi bi-telephone me-1"></i>
                                        {candidato.telefono}
                                      </p>
                                    )}
                                    {candidato.experiencia_anos && (
                                      <p className="text-muted mb-3">
                                        <i className="bi bi-briefcase me-1"></i>
                                        {candidato.experiencia_anos} años de experiencia
                                      </p>
                                    )}
                                    <button
                                      className="btn btn-success btn-sm w-100"
                                      onClick={() => seleccionarCandidato(candidato)}
                                      disabled={saving}
                                    >
                                      <i className="bi bi-check-lg me-1"></i>
                                      Seleccionar Candidato
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : !searching && terminoBusqueda.trim() && (
                        <div className="text-center py-4">
                          <i className="bi bi-person-x text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                          <h6 className="text-muted mb-3">No se encontraron candidatos</h6>
                          <p className="text-muted mb-3">
                            No existe ningún candidato registrado con ese término de búsqueda.
                          </p>
                          <button
                            className="btn btn-primary"
                            onClick={irACrearNuevo}
                            disabled={saving}
                          >
                            <i className="bi bi-person-plus me-2"></i>
                            Crear Nuevo Candidato
                          </button>
                        </div>
                      )}
                  </div>

                  {/* Botón para crear nuevo */}
                  <div className="text-center pt-4 border-top">
                    <p className="text-muted mb-3">¿No encontraste al candidato que buscas?</p>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={irACrearNuevo}
                      disabled={saving}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Crear Nuevo Candidato
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modo crear nuevo candidato */}
            {modoOperacion === 'crear' && (
              <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h5 className="fw-bold text-primary mb-3">
                      <i className="bi bi-person-plus me-2"></i>
                      Crear Nuevo Candidato
                    </h5>
                    <p className="text-muted">
                      Ingresa los datos del candidato para agregarlo al sistema
                    </p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); crearCandidatoYPostulacion(); }}>
                    <div className="row g-4">
                      
                      {/* Información Personal */}
                      <div className="col-12">
                        <div className="card bg-light border-0">
                          <div className="card-body">
                            <h6 className="fw-bold text-primary mb-3">
                              <i className="bi bi-person me-2"></i>
                              Información Personal
                            </h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Nombre Completo *
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  className={getFieldClass('name')}
                                  value={formDataCandidato.name}
                                  onChange={handleCandidatoChange}
                                  placeholder="Ej: Juan Carlos Pérez"
                                  disabled={saving}
                                />
                                {fieldErrors.name && (
                                  <div className="invalid-feedback">
                                    {fieldErrors.name}
                                  </div>
                                )}
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Email *
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  className={getFieldClass('email')}
                                  value={formDataCandidato.email}
                                  onChange={handleCandidatoChange}
                                  placeholder="juan.perez@email.com"
                                  disabled={saving}
                                />
                                {fieldErrors.email && (
                                  <div className="invalid-feedback">
                                    {fieldErrors.email}
                                  </div>
                                )}
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Teléfono
                                </label>
                                <input
                                  type="tel"
                                  name="telefono"
                                  className={getFieldClass('telefono')}
                                  value={formDataCandidato.telefono}
                                  onChange={handleCandidatoChange}
                                  placeholder="+54 11 1234-5678"
                                  disabled={saving}
                                />
                                {fieldErrors.telefono && (
                                  <div className="invalid-feedback">
                                    {fieldErrors.telefono}
                                  </div>
                                )}
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Fecha de Nacimiento
                                </label>
                                <input
                                  type="date"
                                  name="fecha_nacimiento"
                                  className={getFieldClass('fecha_nacimiento')}
                                  value={formDataCandidato.fecha_nacimiento}
                                  onChange={handleCandidatoChange}
                                  disabled={saving}
                                />
                              </div>
                              <div className="col-12">
                                <label className="form-label fw-semibold">
                                  Dirección
                                </label>
                                <textarea
                                  name="direccion"
                                  className={getFieldClass('direccion')}
                                  value={formDataCandidato.direccion}
                                  onChange={handleCandidatoChange}
                                  placeholder="Dirección completa..."
                                  rows="2"
                                  disabled={saving}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información Profesional */}
                      <div className="col-12">
                        <div className="card bg-light border-0">
                          <div className="card-body">
                            <h6 className="fw-bold text-success mb-3">
                              <i className="bi bi-briefcase me-2"></i>
                              Información Profesional
                            </h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Nivel de Educación
                                </label>
                                <select
                                  name="nivel_educacion"
                                  className={getFieldClass('nivel_educacion')}
                                  value={formDataCandidato.nivel_educacion}
                                  onChange={handleCandidatoChange}
                                  disabled={saving}
                                >
                                  <option value="">Seleccionar...</option>
                                  <option value="secundario">Secundario</option>
                                  <option value="terciario">Terciario</option>
                                  <option value="universitario">Universitario</option>
                                  <option value="posgrado">Posgrado</option>
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Años de Experiencia
                                </label>
                                <input
                                  type="number"
                                  name="experiencia_anos"
                                  className={getFieldClass('experiencia_anos')}
                                  value={formDataCandidato.experiencia_anos}
                                  onChange={handleCandidatoChange}
                                  placeholder="0"
                                  min="0"
                                  max="50"
                                  disabled={saving}
                                />
                                {fieldErrors.experiencia_anos && (
                                  <div className="invalid-feedback">
                                    {fieldErrors.experiencia_anos}
                                  </div>
                                )}
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Disponibilidad
                                </label>
                                <select
                                  name="disponibilidad"
                                  className={getFieldClass('disponibilidad')}
                                  value={formDataCandidato.disponibilidad}
                                  onChange={handleCandidatoChange}
                                  disabled={saving}
                                >
                                  <option value="inmediata">Inmediata</option>
                                  <option value="1_semana">1 semana</option>
                                  <option value="15_dias">15 días</option>
                                  <option value="1_mes">1 mes</option>
                                  <option value="2_meses">2 meses</option>
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Modalidad Preferida
                                </label>
                                <select
                                  name="modalidad_preferida"
                                  className={getFieldClass('modalidad_preferida')}
                                  value={formDataCandidato.modalidad_preferida}
                                  onChange={handleCandidatoChange}
                                  disabled={saving}
                                >
                                  <option value="presencial">Presencial</option>
                                  <option value="remoto">Remoto</option>
                                  <option value="hibrido">Híbrido</option>
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Pretensión Salarial (ARS)
                                </label>
                                <input
                                  type="number"
                                  name="pretension_salarial"
                                  className={getFieldClass('pretension_salarial')}
                                  value={formDataCandidato.pretension_salarial}
                                  onChange={handleCandidatoChange}
                                  placeholder="500000"
                                  min="0"
                                  disabled={saving}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  CV (PDF)
                                </label>
                                <input
                                  type="file"
                                  name="cv_path"
                                  className={getFieldClass('cv_path')}
                                  onChange={handleCandidatoChange}
                                  accept=".pdf"
                                  disabled={saving}
                                />
                                <small className="form-text text-muted">
                                  Solo archivos PDF, máximo 5MB
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enlaces Profesionales */}
                      <div className="col-12">
                        <div className="card bg-light border-0">
                          <div className="card-body">
                            <h6 className="fw-bold text-info mb-3">
                              <i className="bi bi-link-45deg me-2"></i>
                              Enlaces Profesionales
                            </h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  LinkedIn
                                </label>
                                <input
                                  type="url"
                                  name="linkedin_url"
                                  className={getFieldClass('linkedin_url')}
                                  value={formDataCandidato.linkedin_url}
                                  onChange={handleCandidatoChange}
                                  placeholder="https://linkedin.com/in/usuario"
                                  disabled={saving}
                                />
                                {fieldErrors.linkedin_url && (
                                  <div className="invalid-feedback">
                                    {fieldErrors.linkedin_url}
                                  </div>
                                )}
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Portfolio
                                </label>
                                <input
                                  type="url"
                                  name="portfolio_url"
                                  className={getFieldClass('portfolio_url')}
                                  value={formDataCandidato.portfolio_url}
                                  onChange={handleCandidatoChange}
                                  placeholder="https://miportfolio.com"
                                  disabled={saving}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estado de la Postulación */}
                      <div className="col-12">
                        <div className="card bg-light border-0">
                          <div className="card-body">
                            <h6 className="fw-bold text-warning mb-3">
                              <i className="bi bi-clipboard-check me-2"></i>
                              Estado de la Postulación
                            </h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Estado Inicial
                                </label>
                                <select
                                  name="estado"
                                  className="form-select"
                                  value={formDataPostulacion.estado}
                                  onChange={handlePostulacionChange}
                                  disabled={saving}
                                >
                                  <option value="postulado">Postulado</option>
                                  <option value="en_revision">En Revisión</option>
                                  <option value="entrevistado">Entrevistado</option>
                                  <option value="seleccionado">Seleccionado</option>
                                  <option value="descartado">Descartado</option>
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                  Puntuación (1-10)
                                </label>
                                <input
                                  type="number"
                                  name="puntuacion"
                                  className="form-control"
                                  value={formDataPostulacion.puntuacion}
                                  onChange={handlePostulacionChange}
                                  placeholder="5"
                                  min="1"
                                  max="10"
                                  disabled={saving}
                                />
                              </div>
                              <div className="col-12">
                                <label className="form-label fw-semibold">
                                  Notas de la Empresa
                                </label>
                                <textarea
                                  name="notas_empresa"
                                  className="form-control"
                                  value={formDataPostulacion.notas_empresa}
                                  onChange={handlePostulacionChange}
                                  placeholder="Comentarios internos sobre el candidato..."
                                  rows="3"
                                  disabled={saving}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Botones de acción */}
                    <div className="d-flex justify-content-between pt-4 border-top">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg"
                        onClick={volverABusqueda}
                        disabled={saving}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver a Buscar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-2"></i>
                            Crear y Agregar
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modo confirmar candidato existente */}
            {modoOperacion === 'confirmar' && candidatoSeleccionado && (
              <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h5 className="fw-bold text-warning mb-3">
                      <i className="bi bi-check-circle me-2"></i>
                      Confirmar Candidato Seleccionado
                    </h5>
                    <p className="text-muted">
                      Revisa los datos del candidato y configura su postulación
                    </p>
                  </div>

                  <div className="row g-4">
                    
                    {/* Datos del candidato */}
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="fw-bold text-primary mb-3">
                            <i className="bi bi-person me-2"></i>
                            Datos del Candidato
                          </h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <strong>Nombre:</strong>
                              <p className="text-muted mb-2">{candidatoSeleccionado.name}</p>
                            </div>
                            <div className="col-md-6">
                              <strong>Email:</strong>
                              <p className="text-muted mb-2">{candidatoSeleccionado.email}</p>
                            </div>
                            {candidatoSeleccionado.telefono && (
                              <div className="col-md-6">
                                <strong>Teléfono:</strong>
                                <p className="text-muted mb-2">{candidatoSeleccionado.telefono}</p>
                              </div>
                            )}
                            {candidatoSeleccionado.experiencia_anos && (
                              <div className="col-md-6">
                                <strong>Experiencia:</strong>
                                <p className="text-muted mb-2">{candidatoSeleccionado.experiencia_anos} años</p>
                              </div>
                            )}
                            {candidatoSeleccionado.nivel_educacion && (
                              <div className="col-md-6">
                                <strong>Educación:</strong>
                                <p className="text-muted mb-2">{candidatoSeleccionado.nivel_educacion}</p>
                              </div>
                            )}
                            {candidatoSeleccionado.disponibilidad && (
                              <div className="col-md-6">
                                <strong>Disponibilidad:</strong>
                                <p className="text-muted mb-2">{candidatoSeleccionado.disponibilidad}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuración de la postulación */}
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="fw-bold text-warning mb-3">
                            <i className="bi bi-clipboard-check me-2"></i>
                            Configuración de la Postulación
                          </h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">
                                Estado Inicial
                              </label>
                              <select
                                name="estado"
                                className="form-select"
                                value={formDataPostulacion.estado}
                                onChange={handlePostulacionChange}
                                disabled={saving}
                              >
                                <option value="postulado">Postulado</option>
                                <option value="en_revision">En Revisión</option>
                                <option value="entrevistado">Entrevistado</option>
                                <option value="seleccionado">Seleccionado</option>
                                <option value="descartado">Descartado</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">
                                Puntuación (1-10)
                              </label>
                              <input
                                type="number"
                                name="puntuacion"
                                className="form-control"
                                value={formDataPostulacion.puntuacion}
                                onChange={handlePostulacionChange}
                                placeholder="5"
                                min="1"
                                max="10"
                                disabled={saving}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold">
                                Notas de la Empresa
                              </label>
                              <textarea
                                name="notas_empresa"
                                className="form-control"
                                value={formDataPostulacion.notas_empresa}
                                onChange={handlePostulacionChange}
                                placeholder="Comentarios internos sobre el candidato..."
                                rows="3"
                                disabled={saving}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Botones de acción */}
                  <div className="d-flex justify-content-between pt-4 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg"
                      onClick={volverABusqueda}
                      disabled={saving}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Volver a Buscar
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning btn-lg"
                      onClick={confirmarCandidatoExistente}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Agregando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Confirmar y Agregar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
