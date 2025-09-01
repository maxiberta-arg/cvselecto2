import React from 'react';

/**
 * Componente de tarjeta de candidato responsiva
 * Se adapta automáticamente a desktop y móvil
 */
export default function TarjetaCandidatoResponsiva({ 
  candidato, 
  onVerDetalle, 
  onEdicionRapida, 
  onEliminar,
  actionLoading,
  index 
}) {
  
  const getBadgeColor = (estado) => {
    const colores = {
      'activo': 'bg-success',
      'en_proceso': 'bg-info', 
      'contratado': 'bg-primary',
      'descartado': 'bg-danger',
      'pausado': 'bg-warning'
    };
    return colores[estado] || 'bg-secondary';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No registrada';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  const obtenerNombreCompleto = () => {
    const user = candidato.candidato?.user;
    const candidatoData = candidato.candidato;
    
    if (user?.name) return user.name;
    if (candidatoData?.nombre || candidatoData?.apellido) {
      return `${candidatoData.nombre || ''} ${candidatoData.apellido || ''}`.trim();
    }
    return 'Sin nombre';
  };

  return (
    <>
      {/* Vista Desktop (pantallas medianas y grandes) */}
      <div className="card h-100 d-none d-md-block">
        <div className="card-body">
          <div className="row align-items-center">
            {/* Avatar y info básica */}
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                {candidato.candidato?.avatar ? (
                  <img 
                    src={`http://localhost:8000${candidato.candidato.avatar}`}
                    alt="Avatar" 
                    className="rounded-circle me-3"
                    style={{width: '60px', height: '60px', objectFit: 'cover'}}
                  />
                ) : (
                  <div className="bg-light rounded-circle me-3 d-flex align-items-center justify-content-center" 
                       style={{width: '60px', height: '60px'}}>
                    <i className="bi bi-person fs-4 text-muted"></i>
                  </div>
                )}
                <div className="flex-grow-1">
                  <h6 className="mb-1">{obtenerNombreCompleto()}</h6>
                  <small className="text-muted">{candidato.candidato?.email}</small>
                </div>
              </div>
            </div>

            {/* Estados y datos */}
            <div className="col-md-3">
              <div>
                <span className={`badge ${getBadgeColor(candidato.estado_interno)} mb-1`}>
                  {candidato.estado_interno?.replace('_', ' ').toUpperCase()}
                </span>
                <br />
                <small className="text-muted">
                  <i className="bi bi-calendar3 me-1"></i>
                  {formatearFecha(candidato.fecha_incorporacion)}
                </small>
              </div>
            </div>

            {/* Puntuación y origen */}
            <div className="col-md-2">
              <div className="text-center">
                {candidato.puntuacion_empresa ? (
                  <>
                    <div className="fs-4 fw-bold text-primary">
                      {parseFloat(candidato.puntuacion_empresa).toFixed(1)}
                    </div>
                    <small className="text-muted">Puntuación</small>
                  </>
                ) : (
                  <small className="text-muted">Sin evaluar</small>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="col-md-2">
              <div>
                {candidato.tags && candidato.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="badge bg-light text-dark me-1 mb-1" style={{fontSize: '0.75em'}}>
                    {tag}
                  </span>
                ))}
                {candidato.tags && candidato.tags.length > 2 && (
                  <span className="badge bg-light text-muted" style={{fontSize: '0.75em'}}>
                    +{candidato.tags.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="col-md-2">
              <div className="btn-group-vertical w-100" role="group">
                <button 
                  className="btn btn-outline-primary btn-sm mb-1"
                  onClick={() => onVerDetalle(candidato)}
                  disabled={actionLoading === candidato.id}
                >
                  <i className="bi bi-eye me-1"></i>Ver
                </button>
                <div className="btn-group" role="group">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => onEdicionRapida(candidato)}
                    disabled={actionLoading === candidato.id}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onEliminar(candidato)}
                    disabled={actionLoading === candidato.id}
                  >
                    {actionLoading === candidato.id ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="bi bi-trash"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista Mobile (pantallas pequeñas) */}
      <div className="card h-100 d-md-none">
        <div className="card-body p-3">
          {/* Header móvil */}
          <div className="d-flex align-items-start mb-2">
            {candidato.candidato?.avatar ? (
              <img 
                src={`http://localhost:8000${candidato.candidato.avatar}`}
                alt="Avatar" 
                className="rounded-circle me-2"
                style={{width: '50px', height: '50px', objectFit: 'cover'}}
              />
            ) : (
              <div className="bg-light rounded-circle me-2 d-flex align-items-center justify-content-center" 
                   style={{width: '50px', height: '50px'}}>
                <i className="bi bi-person fs-5 text-muted"></i>
              </div>
            )}
            
            <div className="flex-grow-1">
              <h6 className="mb-1">{obtenerNombreCompleto()}</h6>
              <small className="text-muted d-block">{candidato.candidato?.email}</small>
              <span className={`badge ${getBadgeColor(candidato.estado_interno)} mt-1`} style={{fontSize: '0.7em'}}>
                {candidato.estado_interno?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Puntuación móvil */}
            <div className="text-end">
              {candidato.puntuacion_empresa ? (
                <div className="fs-5 fw-bold text-primary">
                  {parseFloat(candidato.puntuacion_empresa).toFixed(1)}
                </div>
              ) : (
                <small className="text-muted">-</small>
              )}
            </div>
          </div>

          {/* Info adicional móvil */}
          <div className="row g-2 mb-2">
            <div className="col-6">
              <small className="text-muted">
                <i className="bi bi-calendar3 me-1"></i>
                {formatearFecha(candidato.fecha_incorporacion)}
              </small>
            </div>
            <div className="col-6">
              <small className="text-muted">
                <i className="bi bi-tag me-1"></i>
                {candidato.origen}
              </small>
            </div>
          </div>

          {/* Tags móvil */}
          {candidato.tags && candidato.tags.length > 0 && (
            <div className="mb-2">
              {candidato.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="badge bg-light text-dark me-1" style={{fontSize: '0.7em'}}>
                  {tag}
                </span>
              ))}
              {candidato.tags.length > 3 && (
                <span className="badge bg-light text-muted" style={{fontSize: '0.7em'}}>
                  +{candidato.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Acciones móvil */}
          <div className="d-grid gap-1">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onVerDetalle(candidato)}
              disabled={actionLoading === candidato.id}
            >
              <i className="bi bi-eye me-2"></i>Ver Detalle Completo
            </button>
            <div className="btn-group">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onEdicionRapida(candidato)}
                disabled={actionLoading === candidato.id}
              >
                <i className="bi bi-pencil me-1"></i>Editar
              </button>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={() => onEliminar(candidato)}
                disabled={actionLoading === candidato.id}
              >
                {actionLoading === candidato.id ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-1"></i>Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
