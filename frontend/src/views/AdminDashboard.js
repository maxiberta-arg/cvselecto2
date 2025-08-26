import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';

// Dashboard visual y profesional para administradores
export default function AdminDashboard() {
  const { user } = useAuth();
  const email = user && (user.email || user.correo || user.nombre) ? (user.email || user.correo || user.nombre) : '';
  const nombre = email ? email.split('@')[0].replace('.', ' ') : 'Admin';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ede7f6 60%, #fffde7 100%)' }}>
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card shadow-lg border-0" style={{ background: 'linear-gradient(135deg, #ede7f6 80%, #d1c4e9 100%)', color: '#333', borderRadius: '20px' }}>
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #8e24aa 60%, #ede7f6 100%)', boxShadow: '0 0 18px #8e24aa55' }}>
                  <i className="bi bi-shield-lock text-white" style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 8px #8e24aa88)' }}></i>
                </div>
                <div>
                  <div className="fw-bold">Administrador</div>
                  <div style={{ fontSize: '0.95rem' }}>{email}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-8 d-flex align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: '#8e24aa' }}>¡Hola, {nombre.charAt(0).toUpperCase() + nombre.slice(1)}! <span role="img" aria-label="admin">🛡️</span></h2>
              <div className="text-secondary">Panel de control y gestión global de la plataforma</div>
            </div>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <DashboardCard
              icon="bi bi-people-fill"
              title="Gestión de Usuarios"
              text="Administra usuarios de la plataforma."
              color="#8e24aa"
              bgColor="#ede7f6"
            />
          </div>
          <div className="col-md-4">
            <DashboardCard
              icon="bi bi-bar-chart-line"
              title="Estadísticas"
              text="Visualiza métricas y reportes globales."
              color="#1976d2"
              bgColor="#e3f2fd"
            />
          </div>
          <div className="col-md-4">
            <DashboardCard
              icon="bi bi-journal-text"
              title="Auditoría"
              text="Revisa acciones y logs de la plataforma."
              color="#fbc02d"
              bgColor="#fffde7"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
