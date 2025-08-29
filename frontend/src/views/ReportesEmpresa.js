import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ReportesEmpresa() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBusquedas: 0,
    busquedasActivas: 0,
    totalPostulaciones: 0,
    candidatosUnicos: 0,
    promedioPostulacionesPorBusqueda: 0,
    busquedasConMasPostulaciones: [],
    estadisticasPorMes: [],
    topCandidatos: []
  });

  useEffect(() => {
    cargarReportes();
  }, [user?.id]);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos de la empresa
      const empresaResponse = await api.get(`/empresas/by-user/${user.id}`);
      const empresa = empresaResponse.data;

      // Cargar búsquedas de la empresa
      const busquedasResponse = await api.get('/busquedas-laborales');
      const todasLasBusquedas = busquedasResponse.data;
      const busquedasEmpresa = todasLasBusquedas.filter(b => b.empresa_id === empresa.id);

      // Cargar postulaciones
      const postulacionesResponse = await api.get('/postulaciones');
      const todasLasPostulaciones = postulacionesResponse.data;
      const postulacionesEmpresa = todasLasPostulaciones.filter(
        p => busquedasEmpresa.find(b => b.id === p.busqueda_id)
      );

      // Calcular estadísticas
      const busquedasActivas = busquedasEmpresa.filter(b => b.estado === 'activa').length;
      const candidatosUnicos = new Set(postulacionesEmpresa.map(p => p.candidato_id)).size;
      const promedioPostulaciones = busquedasEmpresa.length > 0 
        ? (postulacionesEmpresa.length / busquedasEmpresa.length).toFixed(1)
        : 0;

      // Top búsquedas con más postulaciones
      const busquedasConStats = busquedasEmpresa.map(busqueda => ({
        ...busqueda,
        postulaciones: postulacionesEmpresa.filter(p => p.busqueda_id === busqueda.id).length
      })).sort((a, b) => b.postulaciones - a.postulaciones).slice(0, 5);

      // Estadísticas por mes (últimos 6 meses)
      const hoy = new Date();
      const estadisticasPorMes = [];
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        const postulacionesMes = postulacionesEmpresa.filter(p => {
          const fechaPostulacion = new Date(p.created_at);
          return fechaPostulacion.getMonth() === fecha.getMonth() && 
                 fechaPostulacion.getFullYear() === fecha.getFullYear();
        }).length;
        
        estadisticasPorMes.push({ mes, postulaciones: postulacionesMes });
      }

      setStats({
        totalBusquedas: busquedasEmpresa.length,
        busquedasActivas,
        totalPostulaciones: postulacionesEmpresa.length,
        candidatosUnicos,
        promedioPostulacionesPorBusqueda: promedioPostulaciones,
        busquedasConMasPostulaciones: busquedasConStats,
        estadisticasPorMes
      });

    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError('Error al cargar los reportes de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = () => {
    // Preparar datos para exportación
    const datosExport = {
      empresa: user?.name || 'Empresa',
      fecha: new Date().toLocaleDateString('es-ES'),
      estadisticas: stats
    };
    
    // Crear contenido CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Reporte de Empresa\n";
    csvContent += `Fecha: ${datosExport.fecha}\n\n`;
    csvContent += "Estadísticas Generales\n";
    csvContent += `Total Búsquedas,${stats.totalBusquedas}\n`;
    csvContent += `Búsquedas Activas,${stats.busquedasActivas}\n`;
    csvContent += `Total Postulaciones,${stats.totalPostulaciones}\n`;
    csvContent += `Candidatos Únicos,${stats.candidatosUnicos}\n`;
    csvContent += `Promedio Postulaciones por Búsqueda,${stats.promedioPostulacionesPorBusqueda}\n\n`;
    
    csvContent += "Búsquedas con Más Postulaciones\n";
    csvContent += "Título,Postulaciones\n";
    stats.busquedasConMasPostulaciones.forEach(busqueda => {
      csvContent += `"${busqueda.titulo}",${busqueda.postulaciones}\n`;
    });

    // Descargar archivo
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_empresa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando reportes...</span>
          </div>
          <p className="mt-3 text-muted">Generando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Reportes y Estadísticas</h1>
          <p className="text-muted">Análisis completo de la actividad de tu empresa</p>
        </div>
        <div>
          <button 
            className="btn btn-success me-2"
            onClick={exportarReporte}
          >
            <i className="bi bi-download me-2"></i>
            Exportar Reporte
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/empresa')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver al Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Estadísticas principales */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-clipboard-plus fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.totalBusquedas}</h3>
              <p className="mb-0">Total Búsquedas</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-check-circle fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.busquedasActivas}</h3>
              <p className="mb-0">Búsquedas Activas</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-people fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.totalPostulaciones}</h3>
              <p className="mb-0">Total Postulaciones</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="bi bi-person-check fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.candidatosUnicos}</h3>
              <p className="mb-0">Candidatos Únicos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y análisis */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Postulaciones por Mes
              </h5>
            </div>
            <div className="card-body">
              {stats.estadisticasPorMes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Postulaciones</th>
                        <th>Progreso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.estadisticasPorMes.map((mes, index) => {
                        const maxPostulaciones = Math.max(...stats.estadisticasPorMes.map(m => m.postulaciones));
                        const porcentaje = maxPostulaciones > 0 ? (mes.postulaciones / maxPostulaciones) * 100 : 0;
                        
                        return (
                          <tr key={index}>
                            <td className="fw-bold">{mes.mes}</td>
                            <td>{mes.postulaciones}</td>
                            <td>
                              <div className="progress">
                                <div 
                                  className="progress-bar bg-primary" 
                                  style={{ width: `${porcentaje}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-graph-up fs-1 text-muted mb-3"></i>
                  <p className="text-muted">No hay datos suficientes para mostrar gráficos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2"></i>
                Métricas Clave
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <strong>Promedio de Postulaciones</strong>
                  <small className="d-block text-muted">Por búsqueda laboral</small>
                </div>
                <span className="badge bg-primary fs-5">{stats.promedioPostulacionesPorBusqueda}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <strong>Tasa de Conversión</strong>
                  <small className="d-block text-muted">Candidatos por búsqueda</small>
                </div>
                <span className="badge bg-success fs-5">
                  {stats.totalBusquedas > 0 ? (stats.candidatosUnicos / stats.totalBusquedas).toFixed(1) : 0}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                <div>
                  <strong>Actividad</strong>
                  <small className="d-block text-muted">Búsquedas activas / Total</small>
                </div>
                <span className="badge bg-info fs-5">
                  {stats.totalBusquedas > 0 ? Math.round((stats.busquedasActivas / stats.totalBusquedas) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top búsquedas */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-star me-2"></i>
                Búsquedas Más Populares
              </h5>
            </div>
            <div className="card-body">
              {stats.busquedasConMasPostulaciones.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Posición</th>
                        <th>Título</th>
                        <th>Modalidad</th>
                        <th>Estado</th>
                        <th>Postulaciones</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.busquedasConMasPostulaciones.map((busqueda, index) => (
                        <tr key={busqueda.id}>
                          <td>
                            <span className={`badge ${
                              index === 0 ? 'bg-warning' : 
                              index === 1 ? 'bg-secondary' :
                              index === 2 ? 'bg-success' : 'bg-primary'
                            }`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td>
                            <strong>{busqueda.titulo}</strong>
                            <div className="small text-muted">{busqueda.ubicacion}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">{busqueda.modalidad}</span>
                          </td>
                          <td>
                            <span className={`badge ${
                              busqueda.estado === 'activa' ? 'bg-success' : 
                              busqueda.estado === 'pausada' ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {busqueda.estado}
                            </span>
                          </td>
                          <td>
                            <span className="fw-bold text-primary">{busqueda.postulaciones}</span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/editar-busqueda-laboral/${busqueda.id}`)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-clipboard-x fs-1 text-muted mb-3"></i>
                  <p className="text-muted">No hay búsquedas para mostrar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
