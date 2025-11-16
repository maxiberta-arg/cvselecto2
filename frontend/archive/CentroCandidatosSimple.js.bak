import React from 'react';
import { useNavigate } from 'react-router-dom';

function CentroCandidatos() {
  const navigate = useNavigate();

  console.log('🎯 CentroCandidatos component loaded!');
  console.log('📍 Current URL:', window.location.pathname);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)' }}>
      <div className="container py-4">
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold text-primary mb-1">
                  <i className="bi bi-grid-3x3-gap me-2"></i>
                  Centro de Candidatos
                </h2>
                <p className="text-muted mb-0">
                  Sistema unificado de gestión de candidatos
                </p>
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/empresa')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de bienvenida */}
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill display-1 text-success"></i>
            </div>
            <h3 className="text-success mb-3">¡Centro de Candidatos Funcionando!</h3>
            <p className="text-muted mb-4">
              El sistema está operativo y listo para gestionar candidatos.
            </p>
            
            <div className="row">
              <div className="col-md-4">
                <div className="card h-100 border-0 bg-light">
                  <div className="card-body text-center">
                    <i className="bi bi-inbox fs-1 text-primary mb-3"></i>
                    <h5>Postulaciones</h5>
                    <p className="text-muted small">Gestiona las postulaciones recibidas</p>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/gestion-candidatos')}
                    >
                      Ver Postulaciones
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card h-100 border-0 bg-light">
                  <div className="card-body text-center">
                    <i className="bi bi-collection fs-1 text-success mb-3"></i>
                    <h5>Pool Privado</h5>
                    <p className="text-muted small">Administra tu pool de candidatos</p>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => navigate('/pool-candidatos')}
                    >
                      Ver Pool
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card h-100 border-0 bg-light">
                  <div className="card-body text-center">
                    <i className="bi bi-search fs-1 text-info mb-3"></i>
                    <h5>Búsqueda</h5>
                    <p className="text-muted small">Encuentra nuevos candidatos</p>
                    <button 
                      className="btn btn-info btn-sm"
                      onClick={() => navigate('/busqueda-candidatos')}
                    >
                      Buscar Candidatos
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

export default CentroCandidatos;
