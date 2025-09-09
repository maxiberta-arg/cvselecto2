import { candidatosMock } from './candidatoService';

// Servicio Mock para Evaluaciones - Temporal hasta configurar backend
class EvaluacionServiceMock {
  constructor() {
    this.evaluaciones = [
      {
        id: 1,
        empresa_candidato_id: 1,
        evaluador_id: 1,
        nombre_evaluacion: "Evaluación Técnica - Full Stack Developer",
        tipo_evaluacion: "tecnica",
        criterios_evaluacion: {
          "conocimientos_tecnicos": { peso: 40, descripcion: "Conocimientos en programación y tecnologías" },
          "experiencia_laboral": { peso: 30, descripcion: "Experiencia previa relevante" },
          "habilidades_comunicacion": { peso: 20, descripcion: "Capacidad de comunicación" },
          "adaptabilidad": { peso: 10, descripcion: "Capacidad de adaptación" }
        },
        puntuaciones: {
          "conocimientos_tecnicos": 85,
          "experiencia_laboral": 75,
          "habilidades_comunicacion": 90,
          "adaptabilidad": 80
        },
        puntuacion_total: 82.5,
        comentarios_generales: "Candidato con excelente perfil técnico y buenas habilidades de comunicación.",
        recomendaciones: "Recomendado para posición senior. Considerar para entrevista final.",
        estado_evaluacion: "completada",
        fecha_inicio: "2024-01-15T09:00:00Z",
        fecha_completada: "2024-01-15T10:30:00Z",
        tiempo_evaluacion_minutos: 90,
        created_at: "2024-01-15T08:45:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        empresaCandidato: {
          id: 1,
          candidato: candidatosMock[0]
        },
        evaluador: {
          id: 1,
          name: "Juan Pérez",
          email: "juan.perez@empresa.com"
        }
      },
      {
        id: 2,
        empresa_candidato_id: 2,
        evaluador_id: 1,
        nombre_evaluacion: "Evaluación Inicial - Marketing Digital",
        tipo_evaluacion: "inicial",
        criterios_evaluacion: {
          "conocimientos_basicos": { peso: 50, descripcion: "Conocimientos básicos del área" },
          "motivacion": { peso: 30, descripcion: "Motivación y entusiasmo" },
          "potential_crecimiento": { peso: 20, descripcion: "Potencial de crecimiento" }
        },
        puntuaciones: null,
        puntuacion_total: null,
        comentarios_generales: "",
        recomendaciones: "",
        estado_evaluacion: "en_progreso",
        fecha_inicio: "2024-01-16T14:00:00Z",
        fecha_completada: null,
        tiempo_evaluacion_minutos: null,
        created_at: "2024-01-16T13:45:00Z",
        updated_at: "2024-01-16T14:00:00Z",
        empresaCandidato: {
          id: 2,
          candidato: candidatosMock[1]
        },
        evaluador: {
          id: 1,
          name: "Juan Pérez",
          email: "juan.perez@empresa.com"
        }
      }
    ];

    this.tiposEvaluacion = {
      'inicial': 'Evaluación Inicial',
      'tecnica': 'Evaluación Técnica',
      'competencias': 'Evaluación de Competencias',
      'final': 'Evaluación Final'
    };

    this.estadosEvaluacion = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completada': 'Completada'
    };
  }

  // Simular delay de red
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Obtener todas las evaluaciones con filtros
  async obtenerEvaluaciones(filtros = {}) {
    await this.delay();
    
    let evaluacionesFiltradas = [...this.evaluaciones];

    // Aplicar filtros
    if (filtros.estado) {
      evaluacionesFiltradas = evaluacionesFiltradas.filter(
        ev => ev.estado_evaluacion === filtros.estado
      );
    }

    if (filtros.tipo) {
      evaluacionesFiltradas = evaluacionesFiltradas.filter(
        ev => ev.tipo_evaluacion === filtros.tipo
      );
    }

    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      evaluacionesFiltradas = evaluacionesFiltradas.filter(
        ev => 
          ev.nombre_evaluacion.toLowerCase().includes(busqueda) ||
          ev.empresaCandidato.candidato.user.name.toLowerCase().includes(busqueda)
      );
    }

    // Paginación simulada
    const page = parseInt(filtros.page) || 1;
    const perPage = parseInt(filtros.per_page) || 15;
    const offset = (page - 1) * perPage;
    const paginatedData = evaluacionesFiltradas.slice(offset, offset + perPage);

    return {
      success: true,
      data: {
        data: paginatedData,
        current_page: page,
        per_page: perPage,
        total: evaluacionesFiltradas.length,
        last_page: Math.ceil(evaluacionesFiltradas.length / perPage)
      }
    };
  }

  // Obtener candidatos disponibles para evaluación
  async obtenerCandidatosParaEvaluacion() {
    await this.delay();
    
    // Simular candidatos que no tienen evaluación o que pueden tener una nueva
    const candidatosDisponibles = candidatosMock.map((candidato, index) => ({
      id: index + 1,
      candidato: candidato,
      puede_evaluar: true,
      evaluaciones_previas: index === 0 ? 1 : 0
    }));

    return {
      success: true,
      data: candidatosDisponibles
    };
  }

  // Crear nueva evaluación
  async crearEvaluacion(datosEvaluacion) {
    await this.delay();

    const nuevaEvaluacion = {
      id: this.evaluaciones.length + 1,
      ...datosEvaluacion,
      evaluador_id: 1, // ID del usuario autenticado
      estado_evaluacion: 'pendiente',
      puntuaciones: null,
      puntuacion_total: null,
      fecha_inicio: null,
      fecha_completada: null,
      tiempo_evaluacion_minutos: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      empresaCandidato: {
        id: datosEvaluacion.empresa_candidato_id,
        candidato: candidatosMock.find((_, index) => index + 1 === datosEvaluacion.empresa_candidato_id) || candidatosMock[0]
      },
      evaluador: {
        id: 1,
        name: "Juan Pérez",
        email: "juan.perez@empresa.com"
      }
    };

    this.evaluaciones.push(nuevaEvaluacion);

    return {
      success: true,
      data: nuevaEvaluacion,
      message: 'Evaluación creada exitosamente'
    };
  }

  // Obtener evaluación específica
  async obtenerEvaluacion(id) {
    await this.delay();

    const evaluacion = this.evaluaciones.find(ev => ev.id === parseInt(id));
    
    if (!evaluacion) {
      throw new Error('Evaluación no encontrada');
    }

    return {
      success: true,
      data: evaluacion,
      meta: {
        puede_editar: evaluacion.estado_evaluacion === 'pendiente' || evaluacion.estado_evaluacion === 'en_progreso',
        puede_completar: evaluacion.estado_evaluacion === 'en_progreso',
        tiempo_transcurrido: evaluacion.fecha_inicio ? 
          Math.floor((new Date() - new Date(evaluacion.fecha_inicio)) / 1000 / 60) : null
      }
    };
  }

  // Actualizar evaluación
  async actualizarEvaluacion(id, datosActualizar) {
    await this.delay();

    const index = this.evaluaciones.findIndex(ev => ev.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Evaluación no encontrada');
    }

    // Si se está iniciando la evaluación
    if (datosActualizar.estado_evaluacion === 'en_progreso' && 
        this.evaluaciones[index].estado_evaluacion === 'pendiente') {
      datosActualizar.fecha_inicio = new Date().toISOString();
    }

    this.evaluaciones[index] = {
      ...this.evaluaciones[index],
      ...datosActualizar,
      updated_at: new Date().toISOString()
    };

    return {
      success: true,
      data: this.evaluaciones[index],
      message: 'Evaluación actualizada exitosamente'
    };
  }

  // Completar evaluación
  async completarEvaluacion(id, datosCompletar) {
    await this.delay();

    const index = this.evaluaciones.findIndex(ev => ev.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Evaluación no encontrada');
    }

    if (this.evaluaciones[index].estado_evaluacion === 'completada') {
      throw new Error('La evaluación ya está completada');
    }

    // Calcular puntuación total
    const criterios = this.evaluaciones[index].criterios_evaluacion;
    let puntuacionTotal = 0;
    
    for (const [criterio, config] of Object.entries(criterios)) {
      const peso = config.peso || 0;
      const puntuacion = datosCompletar.puntuaciones[criterio] || 0;
      puntuacionTotal += (puntuacion * peso / 100);
    }

    this.evaluaciones[index] = {
      ...this.evaluaciones[index],
      ...datosCompletar,
      puntuacion_total: Math.round(puntuacionTotal * 100) / 100,
      estado_evaluacion: 'completada',
      fecha_completada: new Date().toISOString(),
      tiempo_evaluacion_minutos: this.evaluaciones[index].fecha_inicio ? 
        Math.floor((new Date() - new Date(this.evaluaciones[index].fecha_inicio)) / 1000 / 60) : null,
      updated_at: new Date().toISOString()
    };

    return {
      success: true,
      data: this.evaluaciones[index],
      message: 'Evaluación completada exitosamente'
    };
  }

  // Eliminar evaluación
  async eliminarEvaluacion(id) {
    await this.delay();

    const index = this.evaluaciones.findIndex(ev => ev.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Evaluación no encontrada');
    }

    this.evaluaciones.splice(index, 1);

    return {
      success: true,
      message: 'Evaluación eliminada exitosamente'
    };
  }

  // Obtener criterios por tipo
  async obtenerCriteriosPorTipo(tipo) {
    await this.delay();

    const criteriosPorTipo = {
      'inicial': {
        "conocimientos_basicos": { peso: 50, descripcion: "Conocimientos básicos del área" },
        "motivacion": { peso: 30, descripcion: "Motivación y entusiasmo" },
        "potential_crecimiento": { peso: 20, descripcion: "Potencial de crecimiento" }
      },
      'tecnica': {
        "conocimientos_tecnicos": { peso: 40, descripcion: "Conocimientos en programación y tecnologías" },
        "experiencia_laboral": { peso: 30, descripcion: "Experiencia previa relevante" },
        "habilidades_comunicacion": { peso: 20, descripcion: "Capacidad de comunicación" },
        "adaptabilidad": { peso: 10, descripcion: "Capacidad de adaptación" }
      },
      'competencias': {
        "liderazgo": { peso: 25, descripcion: "Capacidad de liderazgo" },
        "trabajo_equipo": { peso: 25, descripcion: "Trabajo en equipo" },
        "resolucion_problemas": { peso: 25, descripcion: "Resolución de problemas" },
        "creatividad": { peso: 25, descripcion: "Creatividad e innovación" }
      },
      'final': {
        "evaluacion_integral": { peso: 60, descripcion: "Evaluación integral del candidato" },
        "fit_cultural": { peso: 25, descripcion: "Ajuste cultural con la empresa" },
        "potential_largo_plazo": { peso: 15, descripcion: "Potencial a largo plazo" }
      }
    };

    if (!criteriosPorTipo[tipo]) {
      throw new Error('Tipo de evaluación no válido');
    }

    return {
      success: true,
      data: {
        tipo: tipo,
        descripcion: this.tiposEvaluacion[tipo],
        criterios: criteriosPorTipo[tipo]
      }
    };
  }

  // Obtener estadísticas
  async obtenerEstadisticas() {
    await this.delay();

    const total = this.evaluaciones.length;
    const completadas = this.evaluaciones.filter(ev => ev.estado_evaluacion === 'completada').length;
    const enProgreso = this.evaluaciones.filter(ev => ev.estado_evaluacion === 'en_progreso').length;
    const pendientes = this.evaluaciones.filter(ev => ev.estado_evaluacion === 'pendiente').length;

    const promedioCalificacion = this.evaluaciones
      .filter(ev => ev.puntuacion_total !== null)
      .reduce((sum, ev) => sum + ev.puntuacion_total, 0) / completadas || 0;

    return {
      success: true,
      data: {
        total_evaluaciones: total,
        completadas: completadas,
        en_progreso: enProgreso,
        pendientes: pendientes,
        promedio_calificacion: Math.round(promedioCalificacion * 100) / 100,
        por_tipo: {
          inicial: this.evaluaciones.filter(ev => ev.tipo_evaluacion === 'inicial').length,
          tecnica: this.evaluaciones.filter(ev => ev.tipo_evaluacion === 'tecnica').length,
          competencias: this.evaluaciones.filter(ev => ev.tipo_evaluacion === 'competencias').length,
          final: this.evaluaciones.filter(ev => ev.tipo_evaluacion === 'final').length
        }
      }
    };
  }
}

// Exportar instancia singleton
export default new EvaluacionServiceMock();
