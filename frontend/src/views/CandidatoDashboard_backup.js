
import React from 'react';
import DashboardCard from '../components/DashboardCard';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../context/AuthContext';

// Dashboard visual para candidatos, moderno y personalizado
export default function CandidatoDashboard() {
  const { user } = useAuth();
  // Usar las propiedades reales del usuario
  const nombre = user && user.name ? user.name : 'Candidato';
  const email = user && user.email ? user.email : '';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card shadow-lg border-0" style={{ background: '#212529', color: '#fff', borderRadius: '18px' }}>
              <div className="card-body d-flex align-items-center">
                <i className="bi bi-person-circle me-3" style={{ fontSize: '2.5rem', color: '#1976d2' }}></i>
                <div>
                  <div className="fw-bold">Candidato</div>
                  <div style={{ fontSize: '0.95rem' }}>{email}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-8 d-flex align-items-center">
            <div>
              <h2 className="fw-bold mb-1">¡Hola, {nombre.charAt(0).toUpperCase() + nombre.slice(1)}! <span role="img" aria-label="saludo">👋</span></h2>
              <div className="text-secondary">Aquí tienes un resumen de tu actividad laboral</div>
            </div>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <DashboardCard
              icon="bi bi-person-circle"
              title="Mi Perfil"
              text="Aquí verás tu información personal y profesional."
              color="#1976d2"
              bgColor="#e3f2fd"
            />
          </div>
          <div className="col-md-4">
            <DashboardCard
              icon="bi bi-file-earmark-check"
              title="Mis Postulaciones"
              text="Listado de búsquedas laborales a las que te has postulado."
              color="#388e3c"
              bgColor="#e8f5e9"
            />
          </div>
          <div className="col-md-4">
            <DashboardCard
              icon="bi bi-search"
              title="Búsquedas Laborales"
              text="Explora oportunidades laborales disponibles."
              color="#512da8"
              bgColor="#ede7f6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
