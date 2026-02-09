import { Routes, Route, Navigate } from "react-router-dom";

// pages
import LoginPage from "./admin/pages/LoginPage";
import DashboardPage from "./admin/pages/DashboardPage";
import StatsPage from "./admin/pages/StatsPage";
import RecoveryPage from "./admin/pages/RecoveryPage";

// layout admin
import AdminLayout from "./admin/layouts/AdminLayout";

// kiosko cliente
import EncuestaContainer from "./user/layouts/EncuestaContainer";
import AnswersScreen from "./user/pages/AnswersScreen";

// 🔐 PROTECTOR
import ProtectedRoutesAdmin from "./admin/routes/ProtectedRoutesAdmin";

function App() {
  return (
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
        <Route path="recovery" element={<RecoveryPage />} />
      </Route>

      {/* KIOSKO */}
      <Route path="/encuesta" element={<EncuestaContainer />}>
        <Route index element={<AnswersScreen />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;
