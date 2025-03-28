import axios from 'axios';

// Obtener la URL base de la variable de entorno
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  console.error("Error: VITE_API_BASE_URL no está definida en el archivo .env");
}

// Crear una instancia de Axios preconfigurada
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // Importante para que las cookies de sesión funcionen
  headers: {
    'Content-Type': 'application/json',
    // Podrías añadir otros headers por defecto aquí si es necesario
  }
});

// Opcional: Interceptores para manejar errores globalmente o añadir tokens
apiClient.interceptors.response.use(
  response => response, // Simplemente devuelve la respuesta si es exitosa
  error => {
    // Aquí puedes manejar errores comunes de la API (401, 403, 500, etc.)
    console.error('Error en la llamada API:', error.response || error.message || error);
    // Podrías redirigir al login en caso de 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // TODO: Implementar lógica de redirección o limpieza de estado de autenticación
      console.warn('Error 401: No autorizado. Redirigir a login...');
      // window.location.href = '/login'; // Ejemplo simple de redirección
    }
    // Rechaza la promesa para que el componente que hizo la llamada pueda manejar el error también
    return Promise.reject(error);
  }
);

export default apiClient;
