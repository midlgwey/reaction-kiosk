import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"

export const useLoginAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();

  // Función auxiliar para mostrar errores con animación
  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!email || !password) {
      triggerError("Todos los campos son obligatorios");
      return;
    }

    // Regex simple para email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      triggerError("Ingresa un correo válido");
      return;
    }

    setLoading(true);

    // Llamada a la API
    try {
      await api.post("/admin/login-admin", {
        email,
        password,
      });
      
      // Dirige al Dashboard
      navigate("/admin/dashboard");

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error al iniciar sesión";
      
      triggerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Retornamos todo lo que el componente visual necesita
  return {
    email, setEmail,
    password, setPassword,
    error,
    loading,
    shake,
    handleLogin
  };
};