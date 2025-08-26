import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">CVSelecto</Link>
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
            <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}
