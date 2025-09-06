import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TabBusqueda({ empresaData, onAgregarAPool, candidatos, onUpdate }) {
  const navigate = useNavigate();
  const [candidatosBusqueda, setCandidatosBusqueda] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    search: '',
    nivel_educacion: '',
    experiencia_anos: '',
    modalidad_preferida: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    buscarCandidatos();
  }, [filtros]);

  const buscarCandidatos = async () => {
    if (!filtros.search && !filtros.nivel_educacion && !filtros.experiencia_anos && !filtros.modalidad_preferida) {
      setCandidatosBusqueda([]);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams(filtros).toString();
      const response = await api.get(`/candidatos-search?${params}`);
      
      setCandidatosBusqueda(response.data || []);
      onUpdate(response.data || []);
      
    } catch (err) {
      setError('Error al buscar candidatos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const agregarAPool = async (candidato) => {
    try {
      await api.post('/pool-candidatos/agregar-existente', {
        candidato_id: candidato.id,
        origen: 'manual',
        estado_interno: 'activo',
        notas_privadas: 'Candidato agregado desde búsqueda manual',
        tags: ['búsqueda_manual']
      });
      
      setSuccess('Candidato agregado al pool privado');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError('Error al agregar candidato al pool');
      console.error(err);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      search: '',
      nivel_educacion: '',
      experiencia_anos: '',
      modalidad_preferida: ''
    });
  };

  return (
    <div>
      {/* Mensajes */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show mb-3">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Instrucciones */}
      <div className="alert alert-info mb-4">
        <h6 className="alert-heading">
          <i className="bi bi-info-circle me-2"></i>
          Búsqueda de Candidatos
        </h6>
        <p className="mb-0">
          Utiliza los filtros para encontrar candidatos que se ajusten a tus necesidades. 
          Los resultados mostrarán candidatos disponibles en el sistema que puedes agregar a tu pool privado.
        </p>
      </div>

      {/* Filtros de búsqueda */}
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtros de Búsqueda
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Búsqueda por nombre o email</label>
              <input 
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, apellido o email..."
                value={filtros.search}
                onChange={(e) => setFiltros(prev => ({...prev, search: e.target.value}))}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Nivel de educación</label>
              <select 
                className="form-select"
                value={filtros.nivel_educacion}
                onChange={(e) => setFiltros(prev => ({...prev, nivel_educacion: e.target.value}))}
              >
                <option value="">Todos los niveles</option>
                <option value="secundario">Secundario</option>
                <option value="terciario">Terciario</option>
                <option value="universitario">Universitario</option>
                <option value="postgrado">Postgrado</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Años de experiencia</label>
              <select 
                className="form-select"
                value={filtros.experiencia_anos}
                onChange={(e) => setFiltros(prev => ({...prev, experiencia_anos: e.target.value}))}
              >
                <option value="">Cualquier experiencia</option>
                <option value="0-1">0-1 años</option>
                <option value="2-3">2-3 años</option>
                <option value="4-6">4-6 años</option>
                <option value="7+">7+ años</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Modalidad preferida</label>
              <select 
                className="form-select"
                value={filtros.modalidad_preferida}
                onChange={(e) => setFiltros(prev => ({...prev, modalidad_preferida: e.target.value}))}
              >
                <option value="">Cualquier modalidad</option>
                <option value="presencial">Presencial</option>
                <option value="remoto">Remoto</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
            <div className="col-md-6 mb-3 d-flex align-items-end">
              <button 
                className="btn btn-outline-secondary me-2"
                onClick={limpiarFiltros}
              >
                <i className="bi bi-x-circle me-2"></i>
                Limpiar Filtros
              </button>
              <button 
                className="btn btn-primary"
                onClick={buscarCandidatos}
                disabled={loading}
              >
                <i className="bi bi-search me-2"></i>
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Buscando candidatos...</span>
          </div>
        </div>
      ) : candidatosBusqueda.length === 0 ? (
        <div className="text-center py-5">
          {Object.values(filtros).some(value => value !== '') ? (
            <>
              <i className="bi bi-search fs-1 text-muted mb-3"></i>
              <h6 className="text-muted">No se encontraron candidatos</h6>
              <p className="text-muted">
                Intenta ajustar los filtros de búsqueda para encontrar más candidatos.
              </p>
            </>
          ) : (
            <>
              <i className="bi bi-funnel fs-1 text-muted mb-3"></i>
              <h6 className="text-muted">Configura los filtros para buscar candidatos</h6>
              <p className="text-muted">
                Utiliza los filtros de arriba para encontrar candidatos que se ajusten a tu búsqueda.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">
              Resultados de búsqueda
            </h6>
            <span className="badge bg-primary fs-6">
              {candidatosBusqueda.length} candidatos encontrados
            </span>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Nivel Educación</th>
                  <th>Experiencia</th>
                  <th>Modalidad</th>
                  <th>Estado Laboral</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {candidatosBusqueda.map(candidato => (
                  <tr key={candidato.id}>
                    <td>
                      <div>
                        <strong>
                          {candidato.user ? candidato.user.name : 
                            `${candidato.nombre || ''} ${candidato.apellido || ''}`.trim() || 'Sin nombre'
                          }
                        </strong>
                        <div className="small text-muted">
                          {candidato.user ? candidato.user.email : candidato.email || 'Sin email'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info">
                        {candidato.nivel_educacion || 'No especificado'}
                      </span>
                    </td>
                    <td>
                      {candidato.experiencia_anos || 'No especificado'}
                    </td>
                    <td>
                      {candidato.modalidad_preferida || 'No especificado'}
                    </td>
                    <td>
                      <span className={`badge ${
                        candidato.estado_laboral === 'buscando_activamente' ? 'bg-success' :
                        candidato.estado_laboral === 'empleado_abierto' ? 'bg-warning' :
                        candidato.estado_laboral === 'empleado_no_busca' ? 'bg-secondary' :
                        'bg-light text-dark'
                      }`}>
                        {candidato.estado_laboral || 'No especificado'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          title="Ver perfil completo"
                          onClick={() => navigate(`/candidatos/${candidato.id}`)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button 
                          className="btn btn-outline-success"
                          title="Agregar a mi pool"
                          onClick={() => agregarAPool(candidato)}
                        >
                          <i className="bi bi-plus-circle"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
