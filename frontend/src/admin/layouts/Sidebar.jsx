import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutAdminService } from "../services/authService";
import kioskly from "../../assets/logo/kioskly-sidebar.png";
import "bootstrap-icons/font/bootstrap-icons.css";

import {
  ChartBarIcon,
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowRightOnRectangleIcon,
  DocumentCheckIcon,
  UserIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
  IdentificationIcon
} from "@heroicons/react/24/solid";

const Sidebar = ({ open, setOpen, setAdmin }) => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored && stored !== "undefined") {
      try {
        setPermissions(JSON.parse(stored));
      } catch (e) {
        setPermissions({});
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdminService();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    } finally {
      localStorage.removeItem("permissions");
      localStorage.removeItem("userRole");
      if (setAdmin) setAdmin(null);
      navigate("/");
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon, key: "dashboard" },
    { name: "Meseros", path: "/admin/waiter", icon: UserIcon, key: "meseros" },
    { name: "Estadísticas", path: "/admin/stats", icon: ChartBarIcon, key: "estadisticas" },
    { name: "Comentarios", path: "/admin/feedback", icon: ChatBubbleBottomCenterTextIcon, key: "comentarios" },
    { name: "Reportes", path: "/admin/recovery", icon: DocumentCheckIcon, key: "reportes" },
    { name: "Empleados", path: "/admin/employees", icon: IdentificationIcon, key: "empleados" },
    { name: "Asistencia", path: "/admin/attendance", icon: UserPlusIcon, key: "asistencia" },
    { name: "Horarios", path: "/admin/weekly-schedule", icon: CalendarDaysIcon, key: "horarios" },
    { name: "Ventas", path: "/admin/sales", icon: PresentationChartLineIcon, key: "ventas" },
  ];

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
                alt="Logo Kioskly" 
                className="w-12 h-12 object-contain rounded-md bg-white p-1" 
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
          {menuItems.map((item) => {
            if (!permissions[item.key]) return null;

            const Icon = item.icon;
            const showSigoDivider = item.key === "empleados";

            return (
              <React.Fragment key={item.key}>
                {showSigoDivider && (
                  <div className="pt-3 pb-1">
                    <div className="my-2 bg-white h-px"></div>
                    {/* pl-[82px] alinea exactamente con el texto "Kioskly" de arriba */}
                    <span className="block pl-[82px]  text-[22px] font-bold text-white/90 tracking-wider uppercase">
                      SIGO
                    </span>
                  </div>
                )}
                <NavLink
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `
                    p-3 flex items-center rounded-md px-4 cursor-pointer transition
                    ${isActive ? "bg-slate-500/70" : "hover:bg-slate-500/50"}
                  `}
                >
                  <Icon className="w-7 h-7 text-white" />
                  <span className="text-[16px] ml-4 font-bold">{item.name}</span>
                </NavLink>
              </React.Fragment>
            );
          })}
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