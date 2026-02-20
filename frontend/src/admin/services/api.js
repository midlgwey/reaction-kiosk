import axios from "axios";
import { navigateTo } from "./navigation";

// Si es producción usa "/api", si es local usa la URL de entorno o localhost
const BASE_URL = import.meta.env.PROD 
  ? "/api" 
  : (import.meta.env.VITE_API_URL || "http://localhost:3000");

const api = axios.create({
  baseURL: BASE_URL, 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor pro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("Sesión expirada");
      navigateTo("/admin/login");
    }
    return Promise.reject(error);
  }
);

export default api;