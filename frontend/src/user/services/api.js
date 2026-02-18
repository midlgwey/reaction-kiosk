import axios from "axios";

//Lee si hay una variable de entorno si no usa localhost por default
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const apiKiosk = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor simple para el Kiosco
apiKiosk.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aquí NO redirigimos al login de admin.
    // Devolvemos error para que muestre una alerta o toast
    console.error("Error de conexión en Kiosco:", error);
    return Promise.reject(error);
  }
);

export default apiKiosk;