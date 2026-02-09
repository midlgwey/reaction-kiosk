import axios from "axios";
import { navigateTo } from "./navigation";

const api = axios.create({
  baseURL: "http://localhost:3000",
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
      navigateTo("/admin/login"); // 🔥 sin recargar app
    }
    return Promise.reject(error);
  }
);

export default api;
