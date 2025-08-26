import axios from 'axios';

// Configuración base de Axios para consumir la API de CVSelecto
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Cambia el puerto si tu backend usa otro
  headers: {
    'Content-Type': 'application/json',
    // Puedes agregar aquí el token de autenticación si lo necesitas
  },
});

export default api;
