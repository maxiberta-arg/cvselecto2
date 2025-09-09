// Configuración para alternar entre servicios reales y mock
// Cambiar USE_MOCK_SERVICES a false cuando el backend esté configurado

export const CONFIG = {
  // Usar servicios mock mientras se configura el backend Laravel
  USE_MOCK_SERVICES: true,
  
  // URLs del backend
  API_BASE_URL: 'http://localhost:8000/api',
  
  // Configuración de la aplicación
  APP_NAME: 'CVSelecto - Centro de Evaluación',
  VERSION: '1.0.0',
  
  // Configuración de paginación
  DEFAULT_PAGE_SIZE: 15,
  MAX_PAGE_SIZE: 50,
  
  // Estados de evaluación
  ESTADOS_EVALUACION: {
    'pendiente': 'Pendiente',
    'en_progreso': 'En Progreso', 
    'completada': 'Completada'
  },
  
  // Tipos de evaluación
  TIPOS_EVALUACION: {
    'inicial': 'Evaluación Inicial',
    'tecnica': 'Evaluación Técnica',
    'competencias': 'Evaluación de Competencias',
    'final': 'Evaluación Final'
  },
  
  // Mensajes para el usuario
  MESSAGES: {
    BACKEND_NOT_AVAILABLE: '⚠️ Usando datos de prueba. Configure el backend Laravel para funcionalidad completa.',
    BACKEND_CONNECTED: '✅ Conectado al backend Laravel.',
    SAVE_SUCCESS: '✅ Guardado exitosamente.',
    SAVE_ERROR: '❌ Error al guardar. Verifique los datos e intente nuevamente.',
    LOAD_ERROR: '❌ Error al cargar datos. Verifique la conexión.',
    DELETE_CONFIRM: '¿Está seguro de que desea eliminar este elemento?',
    EVALUATION_COMPLETED: '✅ Evaluación completada exitosamente.',
    EVALUATION_UPDATED: '✅ Evaluación actualizada exitosamente.'
  }
};

// Función helper para mostrar notificaciones sobre el estado del backend
export const showBackendStatus = () => {
  if (CONFIG.USE_MOCK_SERVICES) {
    console.warn('🔧 Modo de desarrollo: Usando servicios mock');
    console.info('📋 Para habilitar el backend:', 
      '\n1. Instalar PHP y Composer', 
      '\n2. Ejecutar: composer install',
      '\n3. Configurar base de datos en .env',
      '\n4. Ejecutar: php artisan serve --port=8000',
      '\n5. Cambiar USE_MOCK_SERVICES a false en config.js'
    );
  } else {
    console.info('🔗 Usando backend Laravel en:', CONFIG.API_BASE_URL);
  }
};

export default CONFIG;
