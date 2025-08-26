import React from 'react';
import DashboardCard from '../components/DashboardCard';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../context/AuthContext';

// Dashboard visual y profesional para empresas
export default function EmpresaDashboard() {
  const { user } = useAuth();
  // Definir email y nombre correctamente según el objeto user
  const email = user && (user.email || user.correo || user.nombre) ? (user.email || user.correo || user.nombre) : '';
  const nombre = email ? email.split('@')[0].replace('.', ' ') : 'Empresa';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card shadow-lg border-0" style={{ background: 'linear-gradient(135deg, #fffde7 80%, #ffe082 100%)', color: '#333', borderRadius: '20px' }}>
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #fbc02d 60%, #fffde7 100%)', boxShadow: '0 0 18px #fbc02d55' }}>
                  <i className="bi bi-building text-white" style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 8px #fbc02d88)' }}></i>
                </div>
                <div>
                  <div className="fw-bold">Empresa</div>
                  <div style={{ fontSize: '0.95rem' }}>{email}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-8 d-flex align-items-center">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: '#fbc02d' }}>¡Hola, {nombre.charAt(0).toUpperCase() + nombre.slice(1)}! <span role="img" aria-label="saludo">🏢</span></h2>
              <div className="text-secondary">Aquí tienes un resumen de tu actividad empresarial</div>
            </div>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <DashboardCard
              icon="bi bi-building"
              title="Mi Empresa"
              text="Información y datos de la empresa."
              color="#fbc02d"
              bgColor="#fffde7"
            />
          </div>
          <div className="col-md-4">
            <DashboardCard
              icon="bi bi-clipboard-plus"
              title="Publicar Búsqueda"
              text="Crea y gestiona búsquedas laborales."
              color="#1976d2"
              bgColor="#e3f2fd"
            />
          </div>
          <div className="col-md-4">
            <DashboardCard
              icon="bi bi-people-fill"
              title="Candidatos"
              text="Listado de candidatos postulados."
              color="#8e24aa"
              bgColor="#f3e5f5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
