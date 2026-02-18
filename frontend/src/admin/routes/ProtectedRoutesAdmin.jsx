import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api"
import LoadingScreen from "../components/authcomponent/LoadingScreen";

export default function ProtectedRoutesAdmin({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // endpoint simple para validar sesión activa
        await api.get("/admin/me");
        setAuthorized(true);
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // mientras valida cookie
if (loading) {
    return <LoadingScreen />;
  }

  // si NO autorizado → login
  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  // autorizado → deja pasar
  return children;
}
