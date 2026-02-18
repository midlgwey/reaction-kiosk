
import {
  ChartBarIcon,
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowRightOnRectangleIcon,
  DocumentCheckIcon
} from "@heroicons/react/24/solid";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutAdminService } from "../services/authService";
import "bootstrap-icons/font/bootstrap-icons.css";

const Sidebar = ({ open, setOpen, setAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAdminService(); 
      if (setAdmin) setAdmin(null);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      navigate("/"); 
    }
  };

  return (
    <>
      {/* Botón menú móvil */}
      <span
        className="fixed text-white text-4xl top-4 left-4 cursor-pointer lg:hidden z-50 bg-indigo-500 rounded p-1 shadow-lg"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-filter-left"></i>
      </span>

      {/* Contenedor Sidebar */}
      <div
        className={`
          bg-indigo-400 text-white w-72 p-2 overflow-y-auto z-40 transition-transform duration-300 ease-in-out
          fixed inset-y-0 left-0 
          lg:relative lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Encabezado */}
        <div className="text-indigo-900 text-xl">
          <div className="p-2.5 mt-1 flex items-center">
            <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-white"></i>
            <h1 className="font-bold text-white text-[20px] ml-3">
              ServiceReaction
            </h1>
            <i
              className="bi bi-x cursor-pointer ml-auto lg:hidden text-white text-2xl"
              onClick={() => setOpen(false)}
            ></i>
          </div>
          <div className="my-2 bg-white h-px"></div>
        </div>

        {/* Navegación */}
        <nav className="space-y-2 mt-4">
            <NavLink
              to="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="p-2.5 flex items-center rounded-md px-4 cursor-pointer transition hover:bg-slate-500/50"
            >
              <HomeIcon className="w-6 h-6 text-white" />
              <span className="text-[15px] ml-4 font-bold">Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/stats"
              onClick={() => setOpen(false)}
              className="p-2.5 flex items-center rounded-md px-4 cursor-pointer transition hover:bg-slate-500/50"
            >
              <ChartBarIcon className="w-6 h-6 text-white" />
              <span className="text-[15px] ml-4 font-bold">Estadísticas</span>
            </NavLink>

            <NavLink
              to="/admin/feedback"
              onClick={() => setOpen(false)}
              className="p-2.5 flex items-center rounded-md px-4 cursor-pointer transition hover:bg-slate-500/50"
            >
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-white" />
              <span className="text-[15px] ml-4 font-bold">Comentarios</span>
            </NavLink>

            <NavLink
              to="/admin/recovery"
              onClick={() => setOpen(false)}
              className="p-2.5 flex items-center rounded-md px-4 cursor-pointer transition hover:bg-slate-500/50"
            >
              <DocumentCheckIcon className="w-6 h-6 text-white" />
              <span className="text-[15px] ml-4 font-bold">Reportes</span>
            </NavLink>
        </nav>

        <div className="my-4 bg-white/20 h-px"></div>

        {/* Cerrar Sesión */}
        <div
          onClick={handleLogout}
          className="p-2.5 mt-3 flex items-center rounded-md px-4 cursor-pointer hover:bg-red-400 transition"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-600" />
          <span className="text-[15px] ml-4 font-bold text-red-700">Cerrar Sesión</span>
        </div>
      </div>

      {/* Overlay Móvil */}
      {open && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;