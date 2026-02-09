import { useState } from "react";
import {
  ChartBarIcon,
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowRightOnRectangleIcon,
  DocumentCheckIcon
} from "@heroicons/react/24/solid";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api"; // usa tu api.js centralizado
import "bootstrap-icons/font/bootstrap-icons.css";

const Sidebar = ({ setAdmin }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 🔐 borrar cookie en backend
      await api.post("/admin/logout-admin");

      // limpiar estado si existe
      if (setAdmin) setAdmin(null);

      // redirigir login
      navigate("/");
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      navigate("/");
    }
  };

  return (
    <>
      {/* BOTÓN MOBILE */}
      <span
        className="absolute text-white text-4xl top-5 left-4 cursor-pointer lg:hidden z-50"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-filter-left px-2 bg-indigo-400 rounded-md"></i>
      </span>

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 bottom-0 p-2 w-72 overflow-y-auto text-center bg-indigo-400 text-white z-40 transition-all duration-300 ${
          open ? "left-0" : "-left-72"
        } lg:left-0`}
      >
        {/* HEADER */}
        <div className="text-indigo-900 text-xl">
          <div className="p-2.5 mt-1 flex items-center">
            <i className="bi bi-app-indicator px-2 py-1 rounded-md bg-white"></i>
            <h1 className="font-bold text-white text-[20px] ml-3">
              ServiceReaction
            </h1>
            <i
              className="bi bi-x cursor-pointer ml-auto lg:hidden"
              onClick={() => setOpen(false)}
            ></i>
          </div>
          <div className="my-2 bg-white h-px"></div>
        </div>

        {/* DASHBOARD */}
        <NavLink
          to="/admin/dashboard"
          onClick={() => setOpen(false)}
          className="p-2.5 mt-3 flex items-center rounded-md px-4 cursor-pointer hover:bg-slate-500/50 transition"
        >
          <HomeIcon className="w-6 h-6 text-white" />
          <span className="text-[15px] ml-4 font-bold">Dashboard</span>
        </NavLink>

        {/* ESTADÍSTICAS */}
        <NavLink
          to="/admin/stats"
          onClick={() => setOpen(false)}
          className="p-2.5 mt-3 flex items-center rounded-md px-4 cursor-pointer hover:bg-slate-500/50 transition"
        >
          <ChartBarIcon className="w-6 h-6 text-white" />
          <span className="text-[15px] ml-4 font-bold">Estadísticas</span>
        </NavLink>

        {/* COMENTARIOS */}
        <NavLink
          to="/admin/recovery"
          onClick={() => setOpen(false)}
          className="p-2.5 mt-3 flex items-center rounded-md px-4 cursor-pointer hover:bg-slate-500/50 transition"
        >
          <DocumentCheckIcon className="w-6 h-6 text-white" />
          <span className="text-[15px] ml-4 font-bold">Reporte</span>
        </NavLink>

        {/* REPORTES 
        <NavLink
          to="/admin/example"
          onClick={() => setOpen(false)}
          className="p-2.5 mt-3 flex items-center rounded-md px-4 cursor-pointer hover:bg-slate-500/50 transition"
        >
          <DocumentCheckIcon className="w-6 h-6 text-white" />
          <span className="text-[15px] ml-4 font-bold">Reportes</span>
        </NavLink>

        */}

        <div className="my-4 bg-white h-px"></div>

        {/* LOGOUT */}
        <div
          onClick={handleLogout}
          className="p-2.5 mt-3 flex items-center rounded-md px-4 cursor-pointer hover:bg-red-500/50 transition"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-700" />
          <span className="text-[15px] ml-4 font-bold">Cerrar Sesión</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
