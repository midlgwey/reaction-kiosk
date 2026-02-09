import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api"

/*
✔ Protege rutas admin
✔ Verifica cookie JWT real en backend
✔ Evita entrar escribiendo URL manual
✔ Listo para producción
*/

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
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">
          Verificando sesión...
        </p>
      </div>
    );
  }

  // si NO autorizado → login
  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  // autorizado → deja pasar
  return children;
}
