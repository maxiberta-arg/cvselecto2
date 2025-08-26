import React from 'react';

// Página principal con diseño profesional y moderno
export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="mb-4">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 80, height: 80, boxShadow: '0 0 30px #1976d255' }}>
                <i className="bi bi-briefcase-fill text-white" style={{ fontSize: '2.5rem' }}></i>
              </div>
              <h1 className="fw-bold text-primary mb-2">Bienvenido a CVSelecto</h1>
              <p className="lead text-secondary">Plataforma profesional de reclutamiento para candidatos, empresas y administradores.</p>
              <a href="/login" className="btn btn-lg fw-bold shadow-sm" style={{ background: 'linear-gradient(90deg, #1976d2 60%, #512da8 100%)', color: '#fff', border: 'none', fontSize: '1.1rem' }}>
                <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
              </a>
            </div>
          </div>
        </div>
        {/* Cards informativas con gradiente, iconos grandes y layout atractivo */}
        <div className="row mt-4 g-4 justify-content-center">
          <div className="col-md-4">
            <div className="card shadow-lg border-0 h-100" style={{ background: 'linear-gradient(135deg, #e3f2fd 80%, #bbdefb 100%)', borderRadius: '18px' }}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-person-badge" style={{ fontSize: '3rem', color: '#1976d2' }}></i>
                </div>
                <h5 className="card-title fw-bold text-primary">Candidatos</h5>
                <p className="card-text">Crea tu perfil, postúlate y gestiona tu carrera profesional.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-lg border-0 h-100" style={{ background: 'linear-gradient(135deg, #fffde7 80%, #ffe082 100%)', borderRadius: '18px' }}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-building" style={{ fontSize: '3rem', color: '#fbc02d' }}></i>
                </div>
                <h5 className="card-title fw-bold text-warning">Empresas</h5>
                <p className="card-text">Publica búsquedas, gestiona candidatos y encuentra el talento ideal.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-lg border-0 h-100" style={{ background: 'linear-gradient(135deg, #f3e5f5 80%, #ce93d8 100%)', borderRadius: '18px' }}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: '#8e24aa' }}></i>
                </div>
                <h5 className="card-title fw-bold" style={{ color: '#8e24aa' }}>Administradores</h5>
                <p className="card-text">Gestiona usuarios, estadísticas y auditoría de la plataforma.</p>
              </div>
            </div>
          </div>
        </div>
        {/* Créditos o pie de página */}
        <div className="row mt-5">
          <div className="col text-center text-muted">
            <small>CVSelecto &copy; 2025 - Proyecto de Tesis</small>
          </div>
        </div>
      </div>
    </div>
  );
}
