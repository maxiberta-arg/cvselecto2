import React from 'react';

// Dashboard para empresas
// Muestra perfil, publicaciones y candidatos
export default function EmpresaDashboard() {
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Panel de Empresa</h2>
      <div className="row">
        {/* Sección de perfil */}
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Mi Empresa</h5>
              <p className="card-text">Información y datos de la empresa.</p>
              {/* Aquí se mostrarán los datos de la empresa */}
            </div>
          </div>
        </div>
        {/* Sección de publicaciones */}
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Publicar Búsqueda</h5>
              <p className="card-text">Crea y gestiona búsquedas laborales.</p>
              {/* Aquí se mostrarán las búsquedas publicadas */}
            </div>
          </div>
        </div>
        {/* Sección de candidatos */}
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Candidatos</h5>
              <p className="card-text">Listado de candidatos postulados.</p>
              {/* Aquí se mostrarán los candidatos */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
