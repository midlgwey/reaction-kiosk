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
// layout admin
import AdminLayout from "./admin/layouts/AdminLayout";

// kiosko cliente
import EncuestaContainer from "./user/layouts/EncuestaContainer";

//Protecion de rutas
import ProtectedRoutesAdmin from "./admin/routes/ProtectedRoutesAdmin";

import NotFound from "./user/pages/NotFound";


function App() {
  return (
    <>
    {/* Componente que renderiza las notificaciones */}
      <Toaster position="top-center" toastOptions={toastStyles} />

    <Routes>

      {/* LOGIN */}
      <Route path="/" element={<LoginPage />} />

      {/* ADMIN PROTEGIDO */}
      <Route
        path="/admin"
        element={
          <ProtectedRoutesAdmin>
            <AdminLayout />
          </ProtectedRoutesAdmin>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="feedback" element={<SuggestionsPage />} />
        <Route path="recovery" element={<ReportsPage />} />

        {/* Mantiene el Sidebar del Admin */}
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
