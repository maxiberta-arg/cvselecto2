import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Componente de redirección - La funcionalidad se ha consolidado en ConfiguracionEmpresa
export default function PerfilEmpresa() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireccionar automáticamente a la página de configuración consolidada
    navigate('/configuracion-empresa', { replace: true });
  }, [navigate]);

  // Mostrar loading mientras se redirecciona
  return (
    <div className="container-fluid py-5">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Redireccionando...</span>
        </div>
        <p className="mt-3 text-muted">Redireccionando a Configuración...</p>
      </div>
    </div>
  );
}
