import React from 'react';

// Dashboard para administradores
// Muestra gestión de usuarios, estadísticas y auditoría
export default function AdminDashboard() {
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Panel de Administrador</h2>
      <div className="row">
        {/* Sección de gestión de usuarios */}
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Gestión de Usuarios</h5>
              <p className="card-text">Administra usuarios de la plataforma.</p>
              {/* Aquí se mostrarán los usuarios */}
            </div>
          </div>
        </div>
        {/* Sección de estadísticas */}
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Estadísticas</h5>
              <p className="card-text">Visualiza métricas y reportes globales.</p>
              {/* Aquí se mostrarán las estadísticas */}
            </div>
          </div>
        </div>
        {/* Sección de auditoría */}
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Auditoría</h5>
              <p className="card-text">Revisa acciones y logs de la plataforma.</p>
              {/* Aquí se mostrarán los logs de auditoría */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
