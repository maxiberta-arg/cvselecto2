/**
 * Utilidades de seguridad para el frontend
 * Manejo de CSRF tokens y validaciones de seguridad
 */

// Configuración de tokens CSRF para requests API
export const setupCSRFToken = () => {
  // Obtener token CSRF desde meta tag o API
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  
  if (token) {
    // Configurar axios para incluir CSRF token en todas las requests
    if (window.axios) {
      window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    }
  }
};

// Validador de datos de empresa en frontend
export const validateEmpresaData = (data) => {
  const errors = {};

  // Validación de CUIT argentino
  if (data.cuit && !isValidCUIT(data.cuit)) {
    errors.cuit = 'CUIT argentino no válido';
  }

  // Validación de email corporativo
  if (data.email && !isValidCorporateEmail(data.email)) {
    errors.email = 'Debe usar un email corporativo';
  }

  // Validación de teléfono argentino
  if (data.telefono && !isValidArgentinePhone(data.telefono)) {
    errors.telefono = 'Número de teléfono argentino no válido';
  }

  // Validación de rangos salariales
  if (data.salario_min && data.salario_max && data.salario_min > data.salario_max) {
    errors.salario = 'El salario mínimo no puede ser mayor al máximo';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validador de CUIT argentino
const isValidCUIT = (cuit) => {
  // Remover caracteres no numéricos
  const cleanCuit = cuit.replace(/[^0-9]/g, '');
  
  if (cleanCuit.length !== 11) return false;
  
  // Algoritmo de verificación CUIT
  const multiplicador = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  
  for (let i = 0; i < 10; i++) {
    suma += parseInt(cleanCuit[i]) * multiplicador[i];
  }
  
  const resto = suma % 11;
  const digitoVerificador = resto < 2 ? resto : 11 - resto;
  
  return digitoVerificador === parseInt(cleanCuit[10]);
};

// Validador de email corporativo (no permite dominios gratuitos comunes)
const isValidCorporateEmail = (email) => {
  const freeEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'live.com', 'aol.com', 'icloud.com', 'protonmail.com'
  ];
  
  const domain = email.toLowerCase().split('@')[1];
  return domain && !freeEmailDomains.includes(domain);
};

// Validador de teléfono argentino
const isValidArgentinePhone = (phone) => {
  // Patrones para números argentinos
  const patterns = [
    /^(\+54|0054)?\s?9?\s?(11|2[0-9]|3[0-9]|4[0-9])\s?\d{4}\s?\d{4}$/, // Celular
    /^(\+54|0054)?\s?(11|2[0-9]|3[0-9]|4[0-9])\s?\d{4}\s?\d{4}$/ // Fijo
  ];
  
  return patterns.some(pattern => pattern.test(phone));
};

// Utilidad para sanitizar inputs
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
    .replace(/[<>]/g, '') // Remover caracteres HTML básicos
    .trim();
};

// Estados válidos sincronizados con backend
export const VALID_STATES = {
  empresa: ['pendiente', 'verificada', 'rechazada', 'suspendida'],
  postulacion: ['postulado', 'en proceso', 'rechazado', 'seleccionado'],
  busqueda: ['abierta', 'cerrada', 'pausada']
};

// Validador de estados
export const isValidState = (state, type) => {
  return VALID_STATES[type]?.includes(state) || false;
};

// Rate limiting local (complementa al backend)
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  canMakeRequest(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const keyRequests = this.requests.get(key);
    
    // Filtrar requests dentro de la ventana de tiempo
    const recentRequests = keyRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Agregar nueva request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();
