import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { toastStyles } from "./config/toastConfig";
// pages
import LoginPage from "./admin/pages/LoginPage";
import DashboardPage from "./admin/pages/DashboardPage";
import StatsPage from "./admin/pages/StatsPage";
import SuggestionsPage from "./admin/pages/SuggestionsPage";
import ReportsPage from "./admin/pages/ReportsPage";
import QuestionScreen from "./user/pages/QuestionScreen";
import WaiterPage from "./admin/pages/WaiterPage";
import EmployeesPage from "./superadmin/page/EmployeesPage";
import AttendancePage from "./superadmin/page/AttendancePage";
import SchedulewPage from "./superadmin/page/SchedulewPage";
import SalesPage from "./superadmin/page/SalesPage";

// layout admin
import AdminLayout from "./admin/layouts/AdminLayout";
import EncuestaContainer from "./user/layouts/EncuestaContainer";
import NotFound from "./user/pages/NotFound";

// Protecciones
import ProtectedRoutesAdmin from "./admin/routes/ProtectedRoutesAdmin";
import PermissionGuard from "./admin/routes/PermissionGuard";


function App() {
  return (
    <>
    {/* Componente que renderiza las notificaciones */}
      <Toaster position="top-center" toastOptions={toastStyles} />

    <Routes>

      {/* LOGIN */}
      <Route path="/" element={<LoginPage />} />

    {/* ADMIN PROTEGIDO  */}
        <Route
          path="/admin"
          element={
            <ProtectedRoutesAdmin>
              <AdminLayout />
            </ProtectedRoutesAdmin>
          }
        >
          {/* --- RUTAS EXCLUSIVAS DE ADMIN --- */}
          <Route element={<PermissionGuard permissionKey="dashboard" />}>
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<PermissionGuard permissionKey="meseros" />}>
            <Route path="waiter" element={<WaiterPage />} />
          </Route>

          <Route element={<PermissionGuard permissionKey="estadisticas" />}>
            <Route path="stats" element={<StatsPage />} />
          </Route>

          <Route element={<PermissionGuard permissionKey="comentarios" />}>
            <Route path="feedback" element={<SuggestionsPage />} />
          </Route>

          <Route element={<PermissionGuard permissionKey="reportes" />}>
            <Route path="recovery" element={<ReportsPage />} />
          </Route>

          <Route element={<PermissionGuard permissionKey="empleados" />}>
            <Route path="employees" element={<EmployeesPage />} />
          </Route>

          {/* --- RUTAS COMPARTIDAS (SUPERVISOR Y ADMIN) --- */}
          <Route element={<PermissionGuard permissionKey="asistencia" />}>
            <Route path="attendance" element={<AttendancePage />} />
          </Route>

          <Route element={<PermissionGuard permissionKey="horarios" />}>
            <Route path="weekly-schedule" element={<SchedulewPage />} />
          </Route>

          <Route element={<PermissionGuard permissionKey="ventas" />}>
            <Route path="sales" element={<SalesPage />} />
          </Route>

          {/* 404 dentro del panel Admin */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* KIOSKO */}
        <Route path="/questions" element={<EncuestaContainer />}>
          <Route index element={<QuestionScreen />} />
        </Route>

        {/* Atrapa cualquier otra ruta desconocida fuera del admin */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  );
}

export default App;
