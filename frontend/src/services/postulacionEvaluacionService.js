import api from './api';

/**
 * Servicio de Integración: Postulaciones ↔ Evaluaciones
 * 
 * Maneja la comunicación entre el módulo de postulaciones y evaluaciones,
 * proporcionando métodos para:
 * - Obtener evaluaciones de una postulación
 * - Crear evaluaciones desde postulaciones
 * - Cambiar estados con generación automática de evaluaciones
 */
class PostulacionEvaluacionService {

  /**
   * Obtener todas las evaluaciones relacionadas con una postulación
   * @param {number} postulacionId - ID de la postulación
   * @returns {Promise} Respuesta con evaluaciones y metadatos
   */
  async obtenerEvaluacionesDePostulacion(postulacionId) {
    try {
      const response = await api.get(`/postulaciones/${postulacionId}/evaluaciones`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener evaluaciones de postulación:', error);
      throw error;
    }
  }

  /**
   * Crear evaluación manual desde una postulación
   * @param {number} postulacionId - ID de la postulación
   * @param {Object} datosEvaluacion - Datos de la evaluación a crear
   * @returns {Promise} Respuesta con evaluación creada
   */
  async crearEvaluacionDesdePostulacion(postulacionId, datosEvaluacion) {
    try {
      const response = await api.post(`/postulaciones/${postulacionId}/evaluaciones`, datosEvaluacion);
      return response.data;
    } catch (error) {
      console.error('Error al crear evaluación desde postulación:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de postulación (con generación automática de evaluación si procede)
   * @param {number} postulacionId - ID de la postulación
   * @param {string} nuevoEstado - Nuevo estado de la postulación
   * @returns {Promise} Respuesta con postulación actualizada y evaluación generada (si aplica)
   */
  async cambiarEstadoPostulacion(postulacionId, nuevoEstado) {
    try {
      const response = await api.patch(`/postulaciones/${postulacionId}/estado`, {
        estado: nuevoEstado
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de postulación:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles completos de una postulación con información de evaluaciones
   * @param {number} postulacionId - ID de la postulación
   * @returns {Promise} Respuesta con datos completos de la postulación
   */
  async obtenerDetallePostulacion(postulacionId) {
    try {
      const response = await api.get(`/postulaciones/${postulacionId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de postulación:', error);
      throw error;
    }
  }

  /**
   * Verificar si una postulación puede generar evaluación
   * @param {string} estadoPostulacion - Estado actual de la postulación
   * @returns {boolean} True si puede generar evaluación
   */
  puedeGenerarEvaluacion(estadoPostulacion) {
    const estadosPermitidos = ['seleccionado', 'en_revision', 'entrevista'];
    return estadosPermitidos.includes(estadoPostulacion);
  }

  /**
   * Obtener configuración de criterios por defecto según tipo de evaluación
   * @param {string} tipoEvaluacion - Tipo de evaluación
   * @returns {Object} Criterios con pesos y descripciones
   */
  obtenerCriteriosPorDefecto(tipoEvaluacion = 'integral') {
    const criterios = {
      integral: {
        experiencia_tecnica: { peso: 30, descripcion: 'Conocimientos técnicos requeridos' },
        comunicacion: { peso: 20, descripcion: 'Habilidades de comunicación' },
        fit_cultural: { peso: 25, descripcion: 'Ajuste con la cultura empresarial' },
        motivacion: { peso: 25, descripcion: 'Motivación e interés en el puesto' }
      },
      tecnica: {
        conocimientos_tecnicos: { peso: 50, descripcion: 'Dominio de tecnologías específicas' },
        resolucion_problemas: { peso: 30, descripcion: 'Capacidad de resolución de problemas' },
        codigo_limpio: { peso: 20, descripcion: 'Calidad y estructura del código' }
      },
      competencias: {
        liderazgo: { peso: 25, descripcion: 'Capacidades de liderazgo' },
        trabajo_equipo: { peso: 25, descripcion: 'Colaboración y trabajo en equipo' },
        comunicacion: { peso: 25, descripcion: 'Habilidades de comunicación' },
        adaptabilidad: { peso: 25, descripcion: 'Capacidad de adaptación al cambio' }
      },
      cultural: {
        valores_empresa: { peso: 40, descripcion: 'Alineación con valores empresariales' },
        ambiente_trabajo: { peso: 30, descripcion: 'Adaptación al ambiente de trabajo' },
        colaboracion: { peso: 30, descripcion: 'Espíritu colaborativo' }
      }
    };

    return criterios[tipoEvaluacion] || criterios.integral;
  }

  /**
   * Formatear estado de evaluación para mostrar
   * @param {string} estado - Estado de la evaluación
   * @returns {Object} Objeto con clase CSS y texto formateado
   */
  formatearEstadoEvaluacion(estado) {
    const estados = {
      pendiente: { clase: 'warning', texto: 'Pendiente' },
      en_progreso: { clase: 'info', texto: 'En Progreso' },
      completada: { clase: 'success', texto: 'Completada' },
      revisada: { clase: 'primary', texto: 'Revisada' },
      aprobada: { clase: 'success', texto: 'Aprobada' },
      rechazada: { clase: 'danger', texto: 'Rechazada' }
    };

    return estados[estado] || { clase: 'secondary', texto: estado };
  }

  /**
   * Obtener estadísticas de evaluaciones para el dashboard
   * @returns {Promise} Estadísticas de evaluaciones
   */
  async obtenerEstadisticasEvaluaciones() {
    try {
      const response = await api.get('/evaluaciones/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de evaluaciones:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const postulacionEvaluacionService = new PostulacionEvaluacionService();
export default postulacionEvaluacionService;
