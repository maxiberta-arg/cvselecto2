import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Login con diseño profesional y coherente con la página principal
export default function Login() {
  // Lista de usuarios demo (uno por rol)
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Detectar el rol según el usuario seleccionado
  // El rol se obtiene desde la API al autenticar

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Llamada a la API de login (ajusta endpoint y payload según tu backend)
      api.post('/login', {
        email: usuario,
        password: password
      }).then(res => {
        // res.data debe contener todos los datos relevantes del usuario
        const userData = res.data.user || res.data;
        // Guardar en el contexto todos los datos (id, nombre, email, rol, etc.)
        login(userData);
        // Redireccionar según rol
        navigate(`/${userData.rol}`);
      }).catch(() => {
        alert('Credenciales incorrectas o error de conexión');
      });
    } catch {
      alert('Error de conexión');
    }
  };

  return (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e3f2fd 60%, #ede7f6 100%)', position: 'relative', overflow: 'hidden', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      {/* Fondo desenfocado decorativo */}
      <div style={{ position: 'absolute', top: '-120px', left: '-120px', width: '400px', height: '400px', background: 'radial-gradient(circle, #1976d2 0%, #ede7f6 80%)', filter: 'blur(60px)', opacity: 0.3, zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '400px', height: '400px', background: 'radial-gradient(circle, #512da8 0%, #ede7f6 80%)', filter: 'blur(60px)', opacity: 0.3, zIndex: 0 }}></div>
      <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', zIndex: 1 }}>
        <div className="card p-4 border-0" style={{ maxWidth: 430, width: '100%', borderRadius: '32px', boxShadow: '0 16px 64px 0 rgba(33, 150, 243, 0.22)', backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.98)', transition: 'box-shadow 0.3s' }}>
          <div className="text-center mb-4">
            <div className="mx-auto mb-3" style={{ width: 92, height: 92, transition: 'all 0.3s' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center w-100 h-100 animate__animated animate__fadeIn"
                style={{
                  background: 'linear-gradient(135deg, #1976d2 60%, #ede7f6 100%)',
                  boxShadow: '0 0 50px #1976d255, 0 8px 32px 0 rgba(33,150,243,0.13)',
                  border: '4px solid #fff',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}>
                <i
                  className="bi bi-person-circle text-white"
                  style={{
                    fontSize: '2.8rem',
                    animation: 'pulse 1.2s infinite',
                    filter: 'drop-shadow(0 2px 8px rgba(33,150,243,0.18))',
                  }}
                ></i>
              </div>
            </div>
            <h2 className="fw-bold text-primary mb-1" style={{ letterSpacing: '1px', fontFamily: 'inherit' }}>Iniciar Sesión</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white" style={{ borderRadius: '14px 0 0 14px', fontSize: '1.2rem' }}><i className="bi bi-envelope"></i></span>
                <input type="email" className="form-control" value={usuario} onChange={e => setUsuario(e.target.value)} placeholder="Email" required style={{ borderRadius: '0 14px 14px 0', fontSize: '1.08rem', boxShadow: '0 1px 4px 0 rgba(33,150,243,0.07)' }} />
              </div>
            </div>
            <div className="mb-4">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white" style={{ borderRadius: '14px 0 0 14px', fontSize: '1.2rem' }}><i className="bi bi-lock"></i></span>
                <input type={showPassword ? 'text' : 'password'} className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" required style={{ borderRadius: '0 14px 14px 0', fontSize: '1.08rem', boxShadow: '0 1px 4px 0 rgba(33,150,243,0.07)' }} />
                <button type="button" className="btn btn-outline-secondary" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} style={{ borderRadius: '14px' }}>
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="btn w-100 fw-bold shadow-sm" style={{ fontSize: '1.18rem', background: 'linear-gradient(90deg, #1976d2 60%, #512da8 100%)', color: '#fff', border: 'none', borderRadius: '14px', boxShadow: '0 2px 16px 0 rgba(33, 150, 243, 0.15)', letterSpacing: '0.5px', transition: 'background 0.2s' }}>
              <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
      {/* Animación pulse para el icono */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.10); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
