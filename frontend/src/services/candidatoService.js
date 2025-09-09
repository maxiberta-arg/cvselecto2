// Datos mock de candidatos para desarrollo
export const candidatosMock = [
  {
    id: 1,
    user: {
      id: 1,
      name: "María García López",
      email: "maria.garcia@email.com",
      telefono: "+54 11 1234-5678"
    },
    fecha_nacimiento: "1995-03-15",
    ubicacion: "Buenos Aires, Argentina",
    experiencias: [
      {
        id: 1,
        puesto: "Desarrolladora Full Stack",
        empresa: "TechSolutions SA",
        fecha_inicio: "2022-01-15",
        fecha_fin: null,
        descripcion: "Desarrollo de aplicaciones web usando React, Node.js y PostgreSQL"
      },
      {
        id: 2,
        puesto: "Desarrolladora Frontend",
        empresa: "StartupWeb",
        fecha_inicio: "2020-06-01",
        fecha_fin: "2021-12-31",
        descripcion: "Desarrollo de interfaces de usuario con React y Vue.js"
      }
    ],
    educaciones: [
      {
        id: 1,
        titulo: "Ingeniería en Sistemas",
        institucion: "Universidad Tecnológica Nacional",
        fecha_graduacion: "2019-12-15",
        estado: "Completo"
      }
    ],
    habilidades: ["JavaScript", "React", "Node.js", "PostgreSQL", "Git", "AWS"],
    resumen_profesional: "Desarrolladora Full Stack con 4 años de experiencia en tecnologías web modernas. Especializada en React y Node.js con experiencia en arquitecturas escalables."
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@email.com",
      telefono: "+54 11 9876-5432"
    },
    fecha_nacimiento: "1990-08-22",
    ubicacion: "Córdoba, Argentina",
    experiencias: [
      {
        id: 3,
        puesto: "Especialista en Marketing Digital",
        empresa: "AgenciaCreativa",
        fecha_inicio: "2021-03-01",
        fecha_fin: null,
        descripcion: "Gestión de campañas digitales, SEO/SEM y análisis de métricas"
      },
      {
        id: 4,
        puesto: "Community Manager",
        empresa: "Empresa Retail",
        fecha_inicio: "2019-01-15",
        fecha_fin: "2021-02-28",
        descripcion: "Manejo de redes sociales y creación de contenido digital"
      }
    ],
    educaciones: [
      {
        id: 2,
        titulo: "Licenciatura en Marketing",
        institucion: "Universidad Nacional de Córdoba",
        fecha_graduacion: "2018-07-20",
        estado: "Completo"
      }
    ],
    habilidades: ["Google Ads", "Facebook Ads", "SEO", "Analytics", "Content Marketing", "Social Media"],
    resumen_profesional: "Especialista en Marketing Digital con 5 años de experiencia en campañas digitales y análisis de datos. Experto en Google Ads y Facebook Ads."
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Ana Martínez",
      email: "ana.martinez@email.com",
      telefono: "+54 11 5555-7777"
    },
    fecha_nacimiento: "1988-11-10",
    ubicacion: "Rosario, Argentina",
    experiencias: [
      {
        id: 5,
        puesto: "Gerente de Proyectos",
        empresa: "ConsultoraIT",
        fecha_inicio: "2020-01-01",
        fecha_fin: null,
        descripcion: "Gestión de proyectos de software y coordinación de equipos multidisciplinarios"
      },
      {
        id: 6,
        puesto: "Analista de Sistemas",
        empresa: "TechCorp",
        fecha_inicio: "2017-04-01",
        fecha_fin: "2019-12-31",
        descripcion: "Análisis de requerimientos y diseño de sistemas de información"
      }
    ],
    educaciones: [
      {
        id: 3,
        titulo: "Ingeniería Industrial",
        institucion: "Universidad Nacional de Rosario",
        fecha_graduacion: "2016-12-10",
        estado: "Completo"
      },
      {
        id: 4,
        titulo: "MBA en Gestión de Proyectos",
        institucion: "IAE Business School",
        fecha_graduacion: "2019-06-15",
        estado: "Completo"
      }
    ],
    habilidades: ["Gestión de Proyectos", "Scrum", "Agile", "PMI", "Liderazgo", "Análisis de Datos"],
    resumen_profesional: "Gerente de Proyectos con 7 años de experiencia en la industria IT. Certificada PMP con expertise en metodologías ágiles y gestión de equipos."
  }
];

// Servicio mock simple para candidatos
class CandidatoServiceMock {
  async obtenerCandidatos() {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: candidatosMock
    };
  }

  async obtenerCandidato(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const candidato = candidatosMock.find(c => c.id === parseInt(id));
    
    if (!candidato) {
      throw new Error('Candidato no encontrado');
    }

    return {
      success: true,
      data: candidato
    };
  }
}

export default new CandidatoServiceMock();
