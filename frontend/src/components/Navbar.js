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

  return (
    <nav className="navbar navbar-expand-lg shadow-sm" style={{ background: 'linear-gradient(90deg, #fffde7 60%, #ede7f6 100%)', borderBottom: '1.5px solid #fbc02d', minHeight: 64 }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/" style={{ fontSize: '1.5rem', letterSpacing: '1px' }}>
          <i className="bi bi-briefcase-fill me-2" style={{ color: '#fbc02d', fontSize: '1.7rem', filter: 'drop-shadow(0 2px 8px #fbc02d55)' }}></i>
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
                <li className="nav-item"><Link className="nav-link" to="/candidato">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/perfil">Mi Perfil</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/ofertas">Ofertas</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/postulaciones">Postulaciones</Link></li>
              </>
            )}
            {isAuthenticated && user?.rol === 'empresa' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/empresa">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/perfil-empresa">Perfil Empresa</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/busquedas">Búsquedas</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/candidatos">Candidatos</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/entrevistas">Entrevistas</Link></li>
              </>
            )}
            {isAuthenticated && user?.rol === 'admin' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/admin">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/usuarios">Usuarios</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/verificacion">Verificación</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/estadisticas">Estadísticas</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/mantenimiento">Mantenimiento</Link></li>
              </>
            )}
          </ul>
          {isAuthenticated && (
            <div className="d-flex align-items-center ms-auto">
              <div className="me-3 d-flex align-items-center">
                <span className="me-2">{getAvatar()}</span>
                <span className="fw-semibold" style={{ fontSize: '1rem', color: '#333', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nombre || user?.email || user?.correo}</span>
              </div>
              <button className="btn btn-danger px-3 py-1 fw-bold" style={{ borderRadius: 12, boxShadow: '0 2px 8px #fbc02d22', fontSize: '1rem' }} onClick={logout}>
                <i className="bi bi-box-arrow-right me-1"></i> Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
