import { Navigate, Outlet } from "react-router-dom";

export default function PermissionGuard({ permissionKey }) {
  const stored = localStorage.getItem('permissions');
  
  let permissions = {};
  if (stored && stored !== 'undefined') {
    try {
      permissions = JSON.parse(stored);
    } catch (e) {
      permissions = {};
    }
  }

  // Si no tiene el permiso específico, lo mandamos a asistencia
  if (!permissions[permissionKey]) {
    return <Navigate to="/admin/attendance" replace />;
  }

  // Si sí tiene permiso, renderiza la ruta hija
  return <Outlet />;
}