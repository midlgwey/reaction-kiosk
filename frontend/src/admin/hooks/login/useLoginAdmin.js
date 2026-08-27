import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export const useLoginAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      triggerError("Todos los campos son obligatorios");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      triggerError("Ingresa un correo válido");
      return;
    }

    setLoading(true);

    try {
     
      // Llamada al backend para iniciar sesión
      const response = await api.post("/admin/login-admin", {
        email,
        password,
        rememberMe,
      });

      const { permissions, role } = response.data;

      // Guardar permisos de forma segura en localStorage
      if (permissions) {
        localStorage.setItem("permissions", JSON.stringify(permissions));
      }
      if (role) {
        localStorage.setItem("userRole", role);
      }

      // Redirección según el rol devuelto
      if (role === "supervisor") {
        navigate("/admin/attendance");
      } else {
        navigate("/admin/dashboard");
      }
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    error,
    loading,
    shake,
    handleLogin,
  };
};