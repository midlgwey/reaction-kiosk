import axios from "axios";

// Si es producción usa "/api", si es local usa la URL de entorno o localhost
const API_URL = import.meta.env.PROD 
  ? "/api" 
  : (import.meta.env.VITE_API_URL || "http://localhost:3000");

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
    console.error("Error de conexión en Kiosco:", error);
    return Promise.reject(error);
  }
);

export default apiKiosk;