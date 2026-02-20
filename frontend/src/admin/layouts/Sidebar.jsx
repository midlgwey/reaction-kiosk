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
import kioskly from "../../assets/logo/kioskly-sidebar.png"

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
      {/* Contenedor Sidebar */}
      <div
        className={`
          bg-indigo-400 text-white p-3 overflow-y-auto z-40 transition-transform duration-300 ease-in-out
          fixed inset-y-0 left-0 
          w-72 lg:w-80 lg:relative lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Encabezado */}
        <div className="text-indigo-900 text-xl">
          <div className="p-2.5 mt-1 flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={kioskly} 
                alt="Logo ServiceReaction" 
                className="w-12 h-12 object-contain rounded-md bg-white p-1" // Ajusta el w-8 y h-8 a tu gusto
              />
              <h1 className="font-bold text-white text-[22px] ml-3">
                Kioskly
              </h1>
            </div>
            <i
              className="bi bi-x cursor-pointer lg:hidden text-white text-3xl"
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
              className="p-3 flex items-center rounded-md px-4 cursor-pointer transition hover:bg-slate-500/50"
            >
              <HomeIcon className="w-7 h-7 text-white" />
              <span className="text-[16px] ml-4 font-bold">Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/stats"
              onClick={() => setOpen(false)}
              className="p-3 flex items-center rounded-md px-4 cursor-pointer transition hover:bg-slate-500/50"
            >
              <ChartBarIcon className="w-7 h-7 text-white" />
              <span className="text-[16px] ml-4 font-bold">Estadísticas</span>
            </NavLink>

            <NavLink
              to="/admin/feedback"
              onClick={() => setOpen(false)}
              className="p-3 flex items-center rounded-md px-4 cursor-pointer transition hover:bg-slate-500/50"
            >
              <ChatBubbleBottomCenterTextIcon className="w-7 h-7 text-white" />
              <span className="text-[16px] ml-4 font-bold">Comentarios</span>
            </NavLink>

            <NavLink
              to="/admin/recovery"
              onClick={() => setOpen(false)}
              className="p-3 flex items-center rounded-md px-4 cursor-pointer transition hover:bg-slate-500/50"
            >
              <DocumentCheckIcon className="w-7 h-7 text-white" />
              <span className="text-[16px] ml-4 font-bold">Reportes</span>
            </NavLink>
        </nav>

        <div className="my-5 bg-white h-px"></div>

        {/* Cerrar Sesión */}
        <div
          onClick={handleLogout}
          className="p-3 flex items-center rounded-md px-4 cursor-pointer hover:bg-red-400 transition"
        >
          <ArrowRightOnRectangleIcon className="w-7 h-7 text-red-600" />
          <span className="text-[16px] ml-4 font-bold text-red-700">Cerrar Sesión</span>
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