import api from './api';

class EvaluacionService {
  // Obtener todas las evaluaciones con filtros
  async obtenerEvaluaciones(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros si existen
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.candidato) params.append('candidato', filtros.candidato);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.per_page) params.append('per_page', filtros.per_page);

      const response = await api.get(`/evaluaciones?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener evaluaciones:', error);
      throw error;
    }
  }

  // Obtener una evaluación específica
  async obtenerEvaluacion(id) {
    try {
      const response = await api.get(`/evaluaciones/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener evaluación:', error);
      throw error;
    }
  }

  // Crear nueva evaluación
  async crearEvaluacion(datosEvaluacion) {
    try {
      const response = await api.post('/evaluaciones', datosEvaluacion);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear evaluación:', error);
      throw error;
    }
  }

  // Actualizar evaluación existente
  async actualizarEvaluacion(id, datosEvaluacion) {
    try {
      const response = await api.put(`/evaluaciones/${id}`, datosEvaluacion);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar evaluación:', error);
      throw error;
    }
  }

  // Completar evaluación con puntuaciones
  async completarEvaluacion(id, datosComplecion) {
    try {
      const response = await api.post(`/evaluaciones/${id}/completar`, datosComplecion);
      return response.data.data;
    } catch (error) {
      console.error('Error al completar evaluación:', error);
      throw error;
    }
  }

  // Eliminar evaluación
  async eliminarEvaluacion(id) {
    try {
      const response = await api.delete(`/evaluaciones/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar evaluación:', error);
      throw error;
    }
  }

  // Obtener candidatos disponibles para evaluación
  async obtenerCandidatos(filtros = {}) {
    try {
      // Usar el endpoint del pool empresarial existente en backend
      const params = new URLSearchParams();
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.per_page) params.append('per_page', filtros.per_page);

      const url = `/pool-candidatos${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);

      // El backend responde con { success, data, ... } (paginado)
      // Normalizar a { success, data }
      if (response.data && response.data.data !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
      throw error;
    }
  }

  // Obtener evaluaciones de un candidato específico
  async obtenerEvaluacionesCandidato(candidatoId, filtros = {}) {
    try {
      // El backend expone evaluaciones por 'empresaCandidatoId' (tabla pivot).
      // Si el caller pasa un `candidatoId` normal (no empresaCandidatoId), resolveremos
      // automáticamente llamando a `/api/pool-candidatos/by-candidato/{candidatoId}`.
      let empresaCandidatoId = candidatoId;

      // Detectar si es probable un candidatoId (número pequeño) y resolver
      // Si la vista ya pasó un objeto o cadena con prefijo 'ec_' se podría optimizar,
      // pero asumimos numeric ids.
      if (candidatoId && Number.isInteger(Number(candidatoId))) {
        try {
          const resp = await api.get(`/pool-candidatos/by-candidato/${candidatoId}`);
          if (resp.data && resp.data.success && resp.data.data) {
            empresaCandidatoId = resp.data.data.id;
          }
        } catch (err) {
          // Si no se encuentra, re-lanzar el error para que la vista lo maneje
          console.warn('No se pudo resolver empresaCandidatoId para candidatoId:', candidatoId, err?.response?.data || err.message);
          throw err;
        }
      }

      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.tipo) params.append('tipo', filtros.tipo);

      const url = `/evaluaciones/candidato/${empresaCandidatoId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);

      // Backend devuelve { success, data: { candidato, evaluaciones, ... } }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener evaluaciones del candidato:', error);
      throw error;
    }
  }

  // Obtener estadísticas de evaluaciones
  async obtenerEstadisticas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      const response = await api.get(`/evaluaciones/estadisticas?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Obtener criterios predefinidos por tipo de evaluación
  getCriteriosPredefinidos(tipo) {
    const criteriosPorTipo = {
      tecnica: {
        conocimientos_tecnicos: {
          nombre: 'Conocimientos Técnicos',
          descripcion: 'Dominio de tecnologías y herramientas específicas del puesto'
        },
        resolucion_problemas: {
          nombre: 'Resolución de Problemas',
          descripcion: 'Capacidad para analizar y resolver problemas técnicos complejos'
        },
        calidad_codigo: {
          nombre: 'Calidad del Código',
          descripcion: 'Escribir código limpio, mantenible y bien estructurado'
        },
        experiencia_practica: {
          nombre: 'Experiencia Práctica',
          descripcion: 'Aplicación práctica de conocimientos en proyectos reales'
        }
      },
      comportamental: {
        comunicacion: {
          nombre: 'Comunicación',
          descripcion: 'Capacidad para comunicarse de manera efectiva y clara'
        },
        trabajo_equipo: {
          nombre: 'Trabajo en Equipo',
          descripcion: 'Habilidad para colaborar y trabajar efectivamente en equipo'
        },
        liderazgo: {
          nombre: 'Liderazgo',
          descripcion: 'Capacidad para liderar y motivar a otros'
        },
        adaptabilidad: {
          nombre: 'Adaptabilidad',
          descripcion: 'Flexibilidad para adaptarse a cambios y nuevas situaciones'
        }
      },
      cultural: {
        valores_empresa: {
          nombre: 'Alineación con Valores',
          descripcion: 'Compatibilidad con los valores y cultura de la empresa'
        },
        motivacion: {
          nombre: 'Motivación',
          descripcion: 'Nivel de motivación y entusiasmo por el puesto y la empresa'
        },
        crecimiento: {
          nombre: 'Potencial de Crecimiento',
          descripcion: 'Capacidad y deseo de crecer profesionalmente en la empresa'
        },
        compromiso: {
          nombre: 'Compromiso',
          descripcion: 'Dedicación y compromiso con los objetivos de la empresa'
        }
      },
      entrevista: {
        presencia_profesional: {
          nombre: 'Presencia Profesional',
          descripcion: 'Presentación personal y profesionalismo en la entrevista'
        },
        claridad_respuestas: {
          nombre: 'Claridad en Respuestas',
          descripcion: 'Capacidad para responder de manera clara y estructurada'
        },
        conocimiento_puesto: {
          nombre: 'Conocimiento del Puesto',
          descripcion: 'Comprensión de las responsabilidades y requisitos del puesto'
        },
        interes_empresa: {
          nombre: 'Interés en la Empresa',
          descripcion: 'Nivel de interés y conocimiento sobre la empresa'
        }
      },
      referencia: {
        desempeno_anterior: {
          nombre: 'Desempeño Anterior',
          descripcion: 'Calidad del trabajo y desempeño en empleos anteriores'
        },
        relaciones_laborales: {
          nombre: 'Relaciones Laborales',
          descripcion: 'Capacidad para mantener buenas relaciones en el trabajo'
        },
        confiabilidad: {
          nombre: 'Confiabilidad',
          descripcion: 'Consistencia y confiabilidad en el cumplimiento de responsabilidades'
        },
        recomendacion: {
          nombre: 'Recomendación',
          descripcion: 'Nivel de recomendación por parte de referencias anteriores'
        }
      },
      integral: {
        competencias_tecnicas: {
          nombre: 'Competencias Técnicas',
          descripcion: 'Evaluación integral de habilidades técnicas requeridas'
        },
        competencias_blandas: {
          nombre: 'Competencias Blandas',
          descripcion: 'Habilidades interpersonales y de comunicación'
        },
        fit_cultural: {
          nombre: 'Fit Cultural',
          descripcion: 'Compatibilidad con la cultura y valores organizacionales'
        },
        potencial_desarrollo: {
          nombre: 'Potencial de Desarrollo',
          descripcion: 'Capacidad de crecimiento y desarrollo a largo plazo'
        },
        experiencia_global: {
          nombre: 'Experiencia Global',
          descripcion: 'Evaluación general de la experiencia y trayectoria profesional'
        }
      }
    };

    return criteriosPorTipo[tipo] || {};
  }

  // Obtener tipos de evaluación disponibles
  getTiposEvaluacion() {
    return [
      { value: 'tecnica', label: 'Técnica', description: 'Evaluación de habilidades técnicas específicas' },
      { value: 'comportamental', label: 'Comportamental', description: 'Evaluación de habilidades blandas y comportamiento' },
      { value: 'cultural', label: 'Cultural', description: 'Evaluación de fit cultural con la empresa' },
      { value: 'entrevista', label: 'Entrevista', description: 'Evaluación basada en entrevista personal' },
      { value: 'referencia', label: 'Referencia', description: 'Evaluación basada en referencias laborales' },
      { value: 'integral', label: 'Integral', description: 'Evaluación completa que incluye múltiples aspectos' }
    ];
  }

  // Obtener estados de evaluación
  getEstadosEvaluacion() {
    return [
      { value: 'pendiente', label: 'Pendiente', color: 'warning' },
      { value: 'en_progreso', label: 'En Progreso', color: 'info' },
      { value: 'completada', label: 'Completada', color: 'success' },
      { value: 'cancelada', label: 'Cancelada', color: 'danger' }
    ];
  }

  // Calcular puntuación promedio
  calcularPuntuacionPromedio(puntuaciones, criterios) {
    if (!puntuaciones || Object.keys(puntuaciones).length === 0) return 0;
    
    const valores = Object.values(puntuaciones);
    const suma = valores.reduce((total, puntuacion) => total + (puntuacion || 0), 0);
    return valores.length > 0 ? suma / valores.length : 0;
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha) {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener color de badge según estado
  getColorEstado(estado) {
    const colores = {
      pendiente: 'warning',
      en_progreso: 'info',
      completada: 'success',
      cancelada: 'danger'
    };
    return colores[estado] || 'secondary';
  }

  // Obtener color de badge según tipo
  getColorTipo(tipo) {
    const colores = {
      tecnica: 'primary',
      comportamental: 'info',
      cultural: 'warning',
      entrevista: 'success',
      referencia: 'secondary',
      integral: 'danger'
    };
    return colores[tipo] || 'secondary';
  }

  // Validar formulario de evaluación
  validarFormularioEvaluacion(datos) {
    const errores = {};

    if (!datos.empresa_candidato_id) {
      errores.empresa_candidato_id = 'Debe seleccionar un candidato';
    }

    if (!datos.nombre_evaluacion?.trim()) {
      errores.nombre_evaluacion = 'El nombre de la evaluación es obligatorio';
    }

    if (!datos.tipo_evaluacion) {
      errores.tipo_evaluacion = 'Debe seleccionar un tipo de evaluación';
    }

    return {
      esValido: Object.keys(errores).length === 0,
      errores
    };
  }
}

// Exportar instancia del servicio
const evaluacionService = new EvaluacionService();
export default evaluacionService;
