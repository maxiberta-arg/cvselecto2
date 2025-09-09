import React from 'react';

/**
 * Componente BadgeEvaluacion
 * 
 * Muestra un indicador visual del estado de evaluaciones para una postulación.
 * Proporciona información rápida sobre el número de evaluaciones y su estado.
 */
const BadgeEvaluacion = ({ 
  evaluacionesInfo, 
  size = 'sm', 
  showDetails = true,
  onClick = null 
}) => {
  // Si no hay información de evaluaciones, no mostrar nada
  if (!evaluacionesInfo) {
    return null;
  }

  const {
    total_evaluaciones = 0,
    evaluaciones_pendientes = 0,
    evaluaciones_completadas = 0,
    puede_generar_evaluacion = false
  } = evaluacionesInfo;

  // Determinar el color del badge según el estado
  const getBadgeColor = () => {
    if (total_evaluaciones === 0) {
      return puede_generar_evaluacion ? 'warning' : 'secondary';
    }
    
    if (evaluaciones_pendientes > 0) {
      return 'info';
    }
    
    if (evaluaciones_completadas > 0) {
      return 'success';
    }
    
    return 'secondary';
  };

  // Determinar el icono según el estado
  const getIcon = () => {
    if (total_evaluaciones === 0) {
      return puede_generar_evaluacion ? 'bi-plus-circle' : 'bi-clipboard-x';
    }
    
    if (evaluaciones_pendientes > 0) {
      return 'bi-clock-history';
    }
    
    if (evaluaciones_completadas > 0) {
      return 'bi-check-circle-fill';
    }
    
    return 'bi-clipboard-check';
  };

  // Determinar el texto principal
  const getMainText = () => {
    if (total_evaluaciones === 0) {
      return puede_generar_evaluacion ? 'Puede evaluar' : 'Sin evaluaciones';
    }
    
    return `${total_evaluaciones} evaluación${total_evaluaciones > 1 ? 'es' : ''}`;
  };

  // Determinar el texto de detalle
  const getDetailText = () => {
    if (total_evaluaciones === 0 || !showDetails) {
      return null;
    }

    const detalles = [];
    if (evaluaciones_pendientes > 0) {
      detalles.push(`${evaluaciones_pendientes} pendiente${evaluaciones_pendientes > 1 ? 's' : ''}`);
    }
    if (evaluaciones_completadas > 0) {
      detalles.push(`${evaluaciones_completadas} completada${evaluaciones_completadas > 1 ? 's' : ''}`);
    }
    
    return detalles.join(' • ');
  };

  const badgeColor = getBadgeColor();
  const icon = getIcon();
  const mainText = getMainText();
  const detailText = getDetailText();

  // Clase CSS según el tamaño
  const sizeClass = size === 'lg' ? 'fs-6' : size === 'md' ? 'fs-7' : '';

  const badgeElement = (
    <div className={`d-flex align-items-center ${onClick ? 'cursor-pointer' : ''}`}>
      <span className={`badge bg-${badgeColor} d-flex align-items-center ${sizeClass}`}>
        <i className={`bi ${icon} me-1`}></i>
        {mainText}
      </span>
      
      {detailText && size !== 'sm' && (
        <small className="text-muted ms-2">
          {detailText}
        </small>
      )}
    </div>
  );

  // Si hay onClick, envolver en un elemento clickeable
  if (onClick) {
    return (
      <div 
        onClick={onClick}
        className="cursor-pointer"
        title={detailText || mainText}
        style={{ cursor: 'pointer' }}
      >
        {badgeElement}
      </div>
    );
  }

  return (
    <div title={detailText || mainText}>
      {badgeElement}
    </div>
  );
};

/**
 * Componente BadgeEvaluacionSimple
 * Versión simplificada que solo muestra un indicador básico
 */
export const BadgeEvaluacionSimple = ({ 
  totalEvaluaciones = 0, 
  pendientes = 0, 
  puedeGenerar = false 
}) => {
  if (totalEvaluaciones === 0 && !puedeGenerar) {
    return (
      <span className="badge bg-light text-dark">
        <i className="bi bi-dash"></i>
      </span>
    );
  }

  if (totalEvaluaciones === 0 && puedeGenerar) {
    return (
      <span className="badge bg-warning">
        <i className="bi bi-plus-circle"></i>
      </span>
    );
  }

  return (
    <span className={`badge ${pendientes > 0 ? 'bg-info' : 'bg-success'}`}>
      {totalEvaluaciones}
      {pendientes > 0 && (
        <i className="bi bi-clock ms-1"></i>
      )}
    </span>
  );
};

/**
 * Hook para formatear información de evaluaciones
 */
export const useEvaluacionesInfo = (postulacion) => {
  const evaluacionesInfo = postulacion?.evaluaciones_info;
  
  if (!evaluacionesInfo) {
    return {
      tieneEvaluaciones: false,
      totalEvaluaciones: 0,
      pendientes: 0,
      completadas: 0,
      puedeGenerar: false,
      status: 'sin_datos'
    };
  }

  const {
    total_evaluaciones = 0,
    evaluaciones_pendientes = 0,
    evaluaciones_completadas = 0,
    puede_generar_evaluacion = false
  } = evaluacionesInfo;

  let status = 'sin_evaluaciones';
  if (total_evaluaciones > 0) {
    if (evaluaciones_pendientes > 0) {
      status = 'pendientes';
    } else if (evaluaciones_completadas > 0) {
      status = 'completadas';
    }
  } else if (puede_generar_evaluacion) {
    status = 'puede_generar';
  }

  return {
    tieneEvaluaciones: total_evaluaciones > 0,
    totalEvaluaciones: total_evaluaciones,
    pendientes: evaluaciones_pendientes,
    completadas: evaluaciones_completadas,
    puedeGenerar: puede_generar_evaluacion,
    status,
    evaluacionesInfo
  };
};

export default BadgeEvaluacion;
