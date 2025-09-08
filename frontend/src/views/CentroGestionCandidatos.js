import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

// Importar componentes de las vistas existentes
import TabPostulaciones from '../components/TabPostulaciones';
import TabPool from '../components/TabPool';
import TabBusquedas from '../components/TabBusquedas';

export default function CentroGestionCandidatos() {
  const { user } = useAuth();
  
  // Estados principales
  const [tabActiva, setTabActiva] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [empresaData, setEmpresaData] = useState(null);
  
  // Estados de datos unificados
  const [datosUnificados, setDatosUnificados] = useState({
    postulaciones: [],
    pool: [],
    busquedas: [],
    estadisticas: {
      totalCandidatos: 0,
      postulacionesActivas: 0,
      candidatosPool: 0,
      busquedasActivas: 0,
      tasaConversion: 0,
      ultimosMes: {
        nuevasPostulaciones: 0,
        candidatosContratados: 0,
        nuevasBusquedas: 0
      }
    }
  });

  useEffect(() => {
    cargarDatosUnificados();
  }, [user?.id]);

  const cargarDatosUnificados = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener datos de la empresa
      const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
      const empresa = empresaResponse.data;
      setEmpresaData(empresa);

      // 2. Cargar datos de todas las fuentes en paralelo
      const [postulacionesRes, poolRes, busquedasRes] = await Promise.all([
        api.get('/postulaciones'),
        api.get('/empresa-pool'),
        api.get('/busquedas-laborales')
      ]);

      // 3. Filtrar datos por empresa
      const postulacionesEmpresa = postulacionesRes.data.filter(
        p => p.busqueda_laboral?.empresa_id === empresa.id
      );
      
      const poolEmpresa = poolRes.data?.data || [];
      
      const busquedasEmpresa = busquedasRes.data.filter(
        b => parseInt(b.empresa_id) === parseInt(empresa.id)
      );

      // 4. Calcular estadísticas unificadas
      const estadisticas = calcularEstadisticasUnificadas(
        postulacionesEmpresa, 
        poolEmpresa, 
        busquedasEmpresa
      );

      // 5. Actualizar estado
      setDatosUnificados({
        postulaciones: postulacionesEmpresa,
        pool: poolEmpresa,
        busquedas: busquedasEmpresa,
        estadisticas
      });

    } catch (error) {
      console.error('Error cargando datos unificados:', error);
      toast.error('Error al cargar los datos del centro de gestión');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticasUnificadas = (postulaciones, pool, busquedas) => {
    // Obtener candidatos únicos de todas las fuentes
    const candidatosPostulaciones = new Set(postulaciones.map(p => p.candidato_id));
    const candidatosPool = new Set(pool.map(p => p.candidato_id));
    const todosCandidatos = new Set([...candidatosPostulaciones, ...candidatosPool]);

    // Filtrar fechas del último mes
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);

    const nuevasPostulaciones = postulaciones.filter(
      p => new Date(p.created_at) >= unMesAtras
    ).length;

    const candidatosContratados = pool.filter(
      p => p.estado_interno === 'contratado' && new Date(p.updated_at) >= unMesAtras
    ).length;

    const nuevasBusquedas = busquedas.filter(
      b => new Date(b.created_at) >= unMesAtras
    ).length;

    // Tasa de conversión: candidatos contratados / total postulaciones
    const tasaConversion = postulaciones.length > 0 
      ? ((candidatosContratados / postulaciones.length) * 100).toFixed(1)
      : 0;

    return {
      totalCandidatos: todosCandidatos.size,
      postulacionesActivas: postulaciones.filter(p => 
        ['postulado', 'en_revision', 'entrevistado'].includes(p.estado)
      ).length,
      candidatosPool: pool.filter(p => p.estado_interno === 'activo').length,
      busquedasActivas: busquedas.filter(b => b.estado === 'activa').length,
      tasaConversion: parseFloat(tasaConversion),
      ultimosMes: {
        nuevasPostulaciones,
        candidatosContratados,
        nuevasBusquedas
      }
    };
  };

  const renderDashboard = () => (
    <div className="row">
      {/* Métricas principales */}
      <div className="col-12 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-primary mb-2">
                  {datosUnificados.estadisticas.totalCandidatos}
                </div>
                <h6 className="text-muted mb-0">Total Candidatos</h6>
                <small className="text-success">
                  +{datosUnificados.estadisticas.ultimosMes.nuevasPostulaciones} este mes
                </small>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-info mb-2">
                  {datosUnificados.estadisticas.postulacionesActivas}
                </div>
                <h6 className="text-muted mb-0">Postulaciones Activas</h6>
                <small className="text-info">En proceso de evaluación</small>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-warning mb-2">
                  {datosUnificados.estadisticas.candidatosPool}
                </div>
                <h6 className="text-muted mb-0">Pool Activo</h6>
                <small className="text-warning">Candidatos disponibles</small>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-success mb-2">
                  {datosUnificados.estadisticas.tasaConversion}%
                </div>
                <h6 className="text-muted mb-0">Tasa Conversión</h6>
                <small className="text-success">
                  {datosUnificados.estadisticas.ultimosMes.candidatosContratados} contratados este mes
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen por sección */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">📝 Postulaciones Recientes</h6>
          </div>
          <div className="card-body">
            {datosUnificados.postulaciones.slice(0, 5).map(postulacion => (
              <div key={postulacion.id} className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <small className="fw-bold">
                    {postulacion.candidato?.nombre} {postulacion.candidato?.apellido}
                  </small>
                  <br />
                  <small className="text-muted">
                    {postulacion.busqueda_laboral?.titulo}
                  </small>
                </div>
                <span className={`badge ${
                  postulacion.estado === 'postulado' ? 'bg-warning' :
                  postulacion.estado === 'en_revision' ? 'bg-info' :
                  postulacion.estado === 'seleccionado' ? 'bg-success' : 'bg-danger'
                }`}>
                  {postulacion.estado}
                </span>
              </div>
            ))}
            <div className="text-center mt-3">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => setTabActiva('postulaciones')}
              >
                Ver todas las postulaciones
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-info text-white">
            <h6 className="mb-0">👥 Pool de Candidatos</h6>
          </div>
          <div className="card-body">
            {datosUnificados.pool.slice(0, 5).map(candidato => (
              <div key={candidato.id} className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <small className="fw-bold">
                    {candidato.candidato?.nombre} {candidato.candidato?.apellido}
                  </small>
                  <br />
                  <small className="text-muted">
                    Incorporado: {new Date(candidato.fecha_incorporacion).toLocaleDateString()}
                  </small>
                </div>
                <span className={`badge ${
                  candidato.estado_interno === 'activo' ? 'bg-success' :
                  candidato.estado_interno === 'en_proceso' ? 'bg-info' :
                  candidato.estado_interno === 'contratado' ? 'bg-primary' : 'bg-secondary'
                }`}>
                  {candidato.estado_interno}
                </span>
              </div>
            ))}
            <div className="text-center mt-3">
              <button 
                className="btn btn-outline-info btn-sm"
                onClick={() => setTabActiva('pool')}
              >
                Gestionar pool
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-warning text-dark">
            <h6 className="mb-0">🎯 Búsquedas Activas</h6>
          </div>
          <div className="card-body">
            {datosUnificados.busquedas.filter(b => b.estado === 'activa').slice(0, 5).map(busqueda => (
              <div key={busqueda.id} className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <small className="fw-bold">{busqueda.titulo}</small>
                  <br />
                  <small className="text-muted">
                    {busqueda.modalidad} • {busqueda.ubicacion}
                  </small>
                </div>
                <span className="badge bg-warning text-dark">
                  {datosUnificados.postulaciones.filter(p => p.busqueda_laboral_id === busqueda.id).length} postulaciones
                </span>
              </div>
            ))}
            <div className="text-center mt-3">
              <button 
                className="btn btn-outline-warning btn-sm"
                onClick={() => setTabActiva('busquedas')}
              >
                Ver todas las búsquedas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando centro de gestión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h3 mb-0">🏢 Centro de Gestión de Candidatos</h1>
          <p className="text-muted mb-0">
            Panel unificado para gestionar postulaciones, pool de candidatos y búsquedas laborales
          </p>
        </div>
        <div className="col-md-4 text-end">
          <div className="text-muted">
            <small>Empresa: <strong>{empresaData?.nombre}</strong></small>
          </div>
        </div>
      </div>

      {/* Navegación por tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-fill">
            <li className="nav-item">
              <button 
                className={`nav-link ${tabActiva === 'dashboard' ? 'active' : ''}`}
                onClick={() => setTabActiva('dashboard')}
              >
                📊 Dashboard General
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${tabActiva === 'postulaciones' ? 'active' : ''}`}
                onClick={() => setTabActiva('postulaciones')}
              >
                📝 Postulaciones ({datosUnificados.estadisticas.postulacionesActivas})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${tabActiva === 'pool' ? 'active' : ''}`}
                onClick={() => setTabActiva('pool')}
              >
                👥 Pool de Candidatos ({datosUnificados.estadisticas.candidatosPool})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${tabActiva === 'busquedas' ? 'active' : ''}`}
                onClick={() => setTabActiva('busquedas')}
              >
                🎯 Búsquedas ({datosUnificados.estadisticas.busquedasActivas})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Contenido de la tab activa */}
      <div className="row">
        <div className="col-12">
          {tabActiva === 'dashboard' && renderDashboard()}
          
          {tabActiva === 'postulaciones' && (
            <TabPostulaciones 
              postulaciones={datosUnificados.postulaciones}
              onPostulacionesUpdate={cargarDatosUnificados}
              empresaData={empresaData}
            />
          )}
          
          {tabActiva === 'pool' && (
            <TabPool 
              candidatos={datosUnificados.pool}
              onPoolUpdate={cargarDatosUnificados}
              empresaData={empresaData}
            />
          )}
          
          {tabActiva === 'busquedas' && (
            <TabBusquedas 
              busquedas={datosUnificados.busquedas}
              onBusquedasUpdate={cargarDatosUnificados}
              empresaData={empresaData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
