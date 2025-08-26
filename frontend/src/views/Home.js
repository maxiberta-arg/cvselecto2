import React from 'react';

// Página principal con diseño profesional y moderno
export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="mb-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 90, height: 90, background: 'linear-gradient(135deg, #1976d2 60%, #8e24aa 100%)', boxShadow: '0 0 30px #1976d255', animation: 'pulse 2s infinite' }}>
                <i className="bi bi-briefcase-fill text-white" style={{ fontSize: '2.7rem', filter: 'drop-shadow(0 2px 8px #8e24aa88)' }}></i>
              </div>
              <h1 className="fw-bold mb-2" style={{ color: '#1976d2', letterSpacing: '1px' }}>Bienvenido a CVSelecto</h1>
              <p className="lead text-secondary mb-4">Plataforma profesional de reclutamiento para candidatos, empresas y administradores.</p>
              <a href="/login" className="btn btn-lg fw-bold shadow-sm" style={{ background: 'linear-gradient(90deg, #1976d2 60%, #8e24aa 100%)', color: '#fff', border: 'none', fontSize: '1.1rem', borderRadius: 12, boxShadow: '0 2px 8px #8e24aa22', transition: 'background 0.2s' }}>
                <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
              </a>
            </div>
          </div>
        </div>
        {/* Cards informativas con gradiente, iconos grandes y efecto hover */}
        <div className="row mt-4 g-4 justify-content-center">
          <div className="col-md-4">
            <div className="card shadow-lg border-0 h-100 card-landing" style={{ background: 'linear-gradient(135deg, #e3f2fd 80%, #bbdefb 100%)', borderRadius: '18px', transition: 'transform 0.2s, box-shadow 0.2s' }}>
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
            <div className="card shadow-lg border-0 h-100 card-landing" style={{ background: 'linear-gradient(135deg, #fffde7 80%, #ffe082 100%)', borderRadius: '18px', transition: 'transform 0.2s, box-shadow 0.2s' }}>
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
            <div className="card shadow-lg border-0 h-100 card-landing" style={{ background: 'linear-gradient(135deg, #f3e5f5 80%, #ce93d8 100%)', borderRadius: '18px', transition: 'transform 0.2s, box-shadow 0.2s' }}>
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
      {/* Animación pulse para el icono central */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 30px #1976d255, 0 0 0 #8e24aa00; }
          50% { box-shadow: 0 0 50px #8e24aa88, 0 0 30px #1976d255; }
          100% { box-shadow: 0 0 30px #1976d255, 0 0 0 #8e24aa00; }
        }
        .card-landing:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 8px 32px #1976d233;
        }
      `}</style>
    </div>
  );
}
