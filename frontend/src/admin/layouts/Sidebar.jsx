import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  IdentificationIcon,
  ChevronDownIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/solid";

const Sidebar = ({ open, setOpen, setAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [permissions, setPermissions] = useState({});
  const [expandedMenu, setExpandedMenu] = useState(null);

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

  // Detecta si estamos en una ruta relacionada a meseros para expandir automáticamente
  useEffect(() => {
    if (location.pathname.includes("/admin/waiter") || 
        location.pathname.includes("/admin/stats")) {
      setExpandedMenu("meseros");
    }
  }, [location]);

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
    {
      name: "Meseros",
      icon: UserIcon,
      key: "meseros",
      hasSubmenu: true,
      submenu: [
        {
          name: "Captura Diaria",
          path: "/admin/waitertable",
          icon: PlusCircleIcon,
          key: "captura-diaria",
          description: "Registra mesas atendidas por mesero"
        },
        {
          name: "Reporte Mensual",
          path: "/admin/waiter",
          icon: ClipboardDocumentListIcon,
          key: "reporte-mensual",
          description: "Visualiza rendimiento y cumplimiento"
        }
      ]
    },
    { name: "Estadísticas", path: "/admin/stats", icon: ChartBarIcon, key: "estadisticas" },
    { name: "Comentarios", path: "/admin/feedback", icon: ChatBubbleBottomCenterTextIcon, key: "comentarios" },
    { name: "Reportes", path: "/admin/recovery", icon: DocumentCheckIcon, key: "reportes" },
    { name: "Empleados", path: "/admin/employees", icon: IdentificationIcon, key: "empleados" },
    { name: "Asistencia", path: "/admin/attendance", icon: UserPlusIcon, key: "asistencia" },
    { name: "Horarios", path: "/admin/weekly-schedule", icon: CalendarDaysIcon, key: "horarios" },
    { name: "Ventas", path: "/admin/sales", icon: PresentationChartLineIcon, key: "ventas" },
  ];

  const toggleMenu = (key) => {
    setExpandedMenu(expandedMenu === key ? null : key);
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
        <div className="bg-indigo-400 text-xl">
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

            const showSigoDivider = item.key === "empleados";
            const Icon = item.icon;
            const isExpanded = expandedMenu === item.key;

            return (
              <React.Fragment key={item.key}>
                {showSigoDivider && (
                  <div className="pt-3 pb-1">
                    <div className="my-2 bg-white h-px"></div>
                    <span className="block pl-[82px] text-[22px] font-bold text-white/90 tracking-wider uppercase">
                      SIGO
                    </span>
                  </div>
                )}

                {/* Item Principal */}
                {item.hasSubmenu ? (
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`
                      w-full p-3 px-4 flex items-center justify-between rounded-md cursor-pointer transition
                      ${isExpanded ? "bg-slate-500/70" : "hover:bg-slate-500/50"}
                    `}
                  >
                    <div className="flex items-center">
                      <Icon className="w-7 h-7 text-white" />
                      <span className="text-[16px] ml-4 font-bold">{item.name}</span>
                    </div>
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
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
                )}

                {/* Submenu */}
                {item.hasSubmenu && isExpanded && (
                  <div className="space-y-1 pl-4">
                    {item.submenu.map((subitem) => (
                      <NavLink
                        key={subitem.key}
                        to={subitem.path}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) => `
                          group p-3 px-4 flex items-start gap-3 rounded-md cursor-pointer transition
                          ${isActive 
                            ? "bg-white/20 border-l-2 border-white" 
                            : "hover:bg-white/10 border-l-2 border-transparent"
                          }
                        `}
                      >
                        <subitem.icon className="w-5 h-5 text-white mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-white">
                            {subitem.name}
                          </span>
                          <span className="text-[11px] text-white/70 group-hover:text-white/90 transition">
                            {subitem.description}
                          </span>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                )}
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