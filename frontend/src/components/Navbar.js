import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  // Avatar dinámico según rol
  const getAvatar = () => {
    if (!user) return <i className="bi bi-person-circle" style={{ fontSize: '1.7rem', color: '#888' }}></i>;
    if (user.rol === 'empresa') return <i className="bi bi-building" style={{ fontSize: '1.7rem', color: '#fbc02d' }}></i>;
    if (user.rol === 'admin') return <i className="bi bi-shield-lock" style={{ fontSize: '1.7rem', color: '#8e24aa' }}></i>;
    return <i className="bi bi-person-badge" style={{ fontSize: '1.7rem', color: '#1976d2' }}></i>;
  };

  // Color principal según rol
  const navBg = isAuthenticated && user?.rol === 'admin'
    ? 'linear-gradient(90deg, #8e24aa 60%, #ede7f6 100%)'
    : isAuthenticated && user?.rol === 'empresa'
    ? 'linear-gradient(90deg, #fffde7 60%, #fbc02d 100%)'
    : isAuthenticated && user?.rol === 'candidato'
    ? 'linear-gradient(90deg, #e3f2fd 60%, #1976d2 100%)'
    : 'linear-gradient(90deg, #fffde7 60%, #ede7f6 100%)';
  const navBorder = isAuthenticated && user?.rol === 'admin' ? '#8e24aa' : isAuthenticated && user?.rol === 'empresa' ? '#fbc02d' : isAuthenticated && user?.rol === 'candidato' ? '#1976d2' : '#fbc02d';

  // Secciones con iconos y color activo para admin
  const adminSections = [
    { to: '/admin', label: 'Dashboard', icon: 'bi bi-speedometer2' },
    { to: '/usuarios', label: 'Usuarios', icon: 'bi bi-people-fill' },
    { to: '/verificacion', label: 'Verificación', icon: 'bi bi-shield-check' },
    { to: '/estadisticas', label: 'Estadísticas', icon: 'bi bi-bar-chart-line' },
    { to: '/mantenimiento', label: 'Mantenimiento', icon: 'bi bi-tools' },
  ];
  // Secciones con iconos y color activo para empresa
  const empresaSections = [
    { to: '/empresa', label: 'Dashboard', icon: 'bi bi-building' },
    { to: '/configuracion-empresa', label: 'Configuración', icon: 'bi bi-gear' },
    { to: '/mis-busquedas-laborales', label: 'Búsquedas', icon: 'bi bi-clipboard-plus' },
    { to: '/gestion-candidatos', label: 'Candidatos', icon: 'bi bi-people-fill' },
    { to: '/reportes-empresa', label: 'Reportes', icon: 'bi bi-bar-chart' }
  ];
  // Secciones con iconos y color activo para candidato
  const candidatoSections = [
    { to: '/candidato', label: 'Dashboard', icon: 'bi bi-person-badge' },
    { to: '/perfil', label: 'Mi Perfil', icon: 'bi bi-person-circle' },
    { to: '/ofertas', label: 'Ofertas', icon: 'bi bi-briefcase' },
    { to: '/postulaciones', label: 'Postulaciones', icon: 'bi bi-send-check' },
  ];

  return (
    <nav className="navbar navbar-expand-lg shadow-sm fixed-top" style={{ background: navBg, borderBottom: `2px solid ${navBorder}`, minHeight: 64, zIndex: 1030 }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/" style={{ fontSize: '1.5rem', letterSpacing: '1px', color: isAuthenticated && user?.rol === 'admin' ? '#fff' : '#333' }}>
          <i className="bi bi-briefcase-fill me-2" style={{ color: navBorder, fontSize: '1.7rem', filter: 'drop-shadow(0 2px 8px #8e24aa55)' }}></i>
          CVSelecto
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!isAuthenticated && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Registro</Link></li>
              </>
            )}
            {isAuthenticated && user?.rol === 'candidato' && (
              <>
                {candidatoSections.map(({ to, label, icon }) => (
                  <li className="nav-item" key={to}>
                    <Link className="nav-link d-flex align-items-center" to={to} style={{ color: '#1976d2', fontWeight: 500, fontSize: '1.05rem', background: 'transparent', borderRadius: 8, padding: '2px 10px' }}>
                      <i className={`${icon} me-1`} style={{ fontSize: '1.2rem', color: '#1976d2' }}></i>
                      {label}
                    </Link>
                  </li>
                ))}
              </>
            )}
            {isAuthenticated && user?.rol === 'empresa' && (
              <>
                {empresaSections.map(({ to, label, icon }) => (
                  <li className="nav-item" key={to}>
                    <Link className="nav-link d-flex align-items-center" to={to} style={{ color: '#fbc02d', fontWeight: 500, fontSize: '1.05rem' }}>
                      <i className={`${icon} me-1`} style={{ fontSize: '1.2rem', color: '#fbc02d' }}></i>
                      {label}
                    </Link>
                  </li>
                ))}
              </>
            )}
            {isAuthenticated && user?.rol === 'admin' && (
              <>
                {adminSections.map(({ to, label, icon }) => (
                  <li className="nav-item" key={to}>
                    <Link className="nav-link d-flex align-items-center" to={to} style={{ color: '#fff', fontWeight: 500, fontSize: '1.05rem' }}>
                      <i className={`${icon} me-1`} style={{ fontSize: '1.2rem', color: '#fff' }}></i>
                      {label}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
          {isAuthenticated && (
            <div className="d-flex align-items-center ms-auto">
              <div className="me-3 d-flex align-items-center">
                <span className="me-2">{getAvatar()}</span>
                <span className="fw-semibold" style={{ fontSize: '1rem', color: isAuthenticated && user?.rol === 'admin' ? '#fff' : '#333', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || user?.email}</span>
              </div>
              <button 
                className="btn px-3 py-1 fw-bold" 
                style={{ 
                  borderRadius: 12, 
                  boxShadow: isAuthenticated && user?.rol === 'admin' ? '0 2px 8px #8e24aa22' : isAuthenticated && user?.rol === 'empresa' ? '0 2px 8px #fbc02d22' : '0 2px 8px #1976d222', 
                  fontSize: '1rem', 
                  background: isAuthenticated && user?.rol === 'admin' ? '#fff' : isAuthenticated && user?.rol === 'empresa' ? '#fbc02d' : '#1976d2', 
                  color: isAuthenticated && user?.rol === 'admin' ? '#8e24aa' : '#fff', 
                  border: 'none', 
                  transition: 'background 0.2s, color 0.2s' 
                }} 
                onClick={() => logout()}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
