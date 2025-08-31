import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Dashboard visual y profesional para empresas con funcionalidad completa
export default function EmpresaDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    busquedasActivas: 0,
    candidatosTotal: 0,
    postulacionesPendientes: 0
  });
  const [loading, setLoading] = useState(true);

  // Definir email y nombre correctamente según el objeto user
  const email = user && (user.email || user.correo || user.nombre) ? (user.email || user.correo || user.nombre) : '';
  const nombre = email ? email.split('@')[0].replace('.', ' ') : 'Empresa';

  // Cargar estadísticas reales de la empresa
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        console.log('Cargando estadísticas para usuario:', user.id);
        
        // Cargar datos de la empresa
        const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
        const empresa = empresaResponse.data;
        console.log('Datos de empresa cargados:', empresa);

        // Cargar búsquedas de la empresa
        const busquedasResponse = await api.get('/busquedas-laborales');
        const todasLasBusquedas = busquedasResponse.data;
        console.log('Todas las búsquedas cargadas:', todasLasBusquedas);
        console.log('ID de empresa actual:', empresa.id);
        const busquedasEmpresa = todasLasBusquedas.filter(b => {
          console.log(`Búsqueda ${b.id}: empresa_id=${b.empresa_id}, coincide=${b.empresa_id === empresa.id}`);
          return b.empresa_id === empresa.id;
        });
        console.log('Búsquedas filtradas de la empresa:', busquedasEmpresa);

        // Cargar postulaciones relacionadas
        const postulacionesResponse = await api.get(`/postulaciones`);
        const todasLasPostulaciones = postulacionesResponse.data;
        console.log('Total de postulaciones en sistema:', todasLasPostulaciones.length);
        
        const postulacionesEmpresa = todasLasPostulaciones.filter(
          p => busquedasEmpresa.find(b => b.id === p.busqueda_id)
        );
        console.log('Postulaciones para la empresa:', postulacionesEmpresa);

        // Calcular estadísticas reales
        const busquedasActivas = busquedasEmpresa.filter(b => b.estado === 'abierta').length;
        const candidatosUnicos = new Set(postulacionesEmpresa.map(p => p.candidato_id)).size;
        const postulacionesPendientes = postulacionesEmpresa.filter(p => p.estado === 'postulado').length;
        
        console.log('Estadísticas calculadas:', {
          busquedasActivas,
          candidatosUnicos,
          postulacionesPendientes,
          totalBusquedas: busquedasEmpresa.length,
          totalPostulaciones: postulacionesEmpresa.length,
          estadosEncontrados: busquedasEmpresa.map(b => b.estado)
        });
        
        setStats({
          busquedasActivas,
          candidatosTotal: candidatosUnicos,
          postulacionesPendientes
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Fallback a datos mock si falla la API
        setStats({
          busquedasActivas: 0,
          candidatosTotal: 0,
          postulacionesPendientes: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      cargarEstadisticas();
    }
  }, [user?.id]);

  // Handlers de navegación
  const navegarAPerfil = () => navigate('/configuracion-empresa');
  const navegarABusquedas = () => navigate('/mis-busquedas-laborales');
  const navegarACandidatos = () => navigate('/gestion-candidatos');
  const crearBusqueda = () => navigate('/crear-busqueda-laboral');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        
        {/* Header de bienvenida */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card shadow-lg border-0" style={{ background: 'linear-gradient(135deg, #fffde7 80%, #ffe082 100%)', color: '#333', borderRadius: '20px' }}>
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #fbc02d 60%, #fffde7 100%)', boxShadow: '0 0 18px #fbc02d55' }}>
                  <i className="bi bi-building text-white" style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 8px #fbc02d88)' }}></i>
                </div>
                <div>
                  <div className="fw-bold">Empresa</div>
                  <div style={{ fontSize: '0.95rem' }}>{email}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-8 d-flex align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: '#fbc02d' }}>¡Hola, {nombre.charAt(0).toUpperCase() + nombre.slice(1)}! <span role="img" aria-label="saludo">🏢</span></h2>
              <div className="text-secondary">Aquí tienes un resumen de tu actividad empresarial</div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-center shadow-sm border-0" style={{ backgroundColor: '#e8f5e8', borderRadius: '15px' }}>
              <div className="card-body">
                <i className="bi bi-clipboard-check text-success mb-2" style={{ fontSize: '2rem' }}></i>
                <h3 className="fw-bold text-success mb-0">
                  {loading ? <div className="spinner-border spinner-border-sm" role="status"></div> : stats.busquedasActivas}
                </h3>
                <small className="text-muted">Búsquedas Activas</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center shadow-sm border-0" style={{ backgroundColor: '#e3f2fd', borderRadius: '15px' }}>
              <div className="card-body">
                <i className="bi bi-people text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                <h3 className="fw-bold text-primary mb-0">
                  {loading ? <div className="spinner-border spinner-border-sm" role="status"></div> : stats.candidatosTotal}
                </h3>
                <small className="text-muted">Candidatos Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center shadow-sm border-0" style={{ backgroundColor: '#fff3e0', borderRadius: '15px' }}>
              <div className="card-body">
                <i className="bi bi-clock text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                <h3 className="fw-bold text-warning mb-0">
                  {loading ? <div className="spinner-border spinner-border-sm" role="status"></div> : stats.postulacionesPendientes}
                </h3>
                <small className="text-muted">Postulaciones Pendientes</small>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de navegación principales */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div 
              className="card shadow-lg border-0 h-100 cursor-pointer"
              style={{ 
                background: '#fffde7', 
                borderRadius: '18px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={navegarAPerfil}
            >
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-building" style={{ fontSize: '2.5rem', color: '#fbc02d' }}></i>
                </div>
                <h5 className="card-title fw-bold" style={{ color: '#fbc02d' }}>Mi Empresa</h5>
                <p className="card-text">Información y datos de la empresa.</p>
                <small className="text-muted">
                  <i className="bi bi-arrow-right me-1"></i>
                  Ir al Perfil
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div 
              className="card shadow-lg border-0 h-100"
              style={{ 
                background: '#e3f2fd', 
                borderRadius: '18px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={navegarABusquedas}
            >
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-clipboard-plus" style={{ fontSize: '2.5rem', color: '#1976d2' }}></i>
                </div>
                <h5 className="card-title fw-bold" style={{ color: '#1976d2' }}>Mis Búsquedas</h5>
                <p className="card-text">Gestiona todas tus ofertas laborales.</p>
                <small className="text-muted">
                  <i className="bi bi-arrow-right me-1"></i>
                  Ver Búsquedas
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div 
              className="card shadow-lg border-0 h-100"
              style={{ 
                background: '#f3e5f5', 
                borderRadius: '18px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={navegarACandidatos}
            >
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-people-fill" style={{ fontSize: '2.5rem', color: '#8e24aa' }}></i>
                </div>
                <h5 className="card-title fw-bold" style={{ color: '#8e24aa' }}>Candidatos</h5>
                <p className="card-text">Gestiona candidatos y postulaciones.</p>
                <small className="text-muted">
                  <i className="bi bi-arrow-right me-1"></i>
                  Ver Candidatos
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #f5f5f5 60%, #eeeeee 100%)' }}>
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <i className="bi bi-lightning-charge text-warning me-2"></i>
                  Acciones Rápidas
                </h5>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <button 
                      className="btn btn-primary btn-lg w-100"
                      onClick={crearBusqueda}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Crear Nueva Búsqueda
                    </button>
                  </div>
                  <div className="col-md-6 mb-2">
                    <button 
                      className="btn btn-success btn-lg w-100"
                      onClick={() => navigate('/gestion-candidatos')}
                      title="Gestiona todos los candidatos que se han postulado a tus búsquedas"
                    >
                      <i className="bi bi-people me-2"></i>
                      Gestionar Candidatos
                    </button>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-4">
                    <button 
                      className="btn btn-info btn-lg w-100"
                      onClick={() => navigate('/busqueda-candidatos')}
                      title="Buscar candidatos con filtros avanzados"
                    >
                      <i className="bi bi-search me-2"></i>
                      Buscar Candidatos
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-secondary btn-lg w-100"
                      onClick={() => navigate('/reportes-empresa')}
                    >
                      <i className="bi bi-graph-up me-2"></i>
                      Ver Reportes
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-warning btn-lg w-100"
                      onClick={() => navigate('/configuracion-empresa')}
                    >
                      <i className="bi bi-gear me-2"></i>
                      Configuración
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
