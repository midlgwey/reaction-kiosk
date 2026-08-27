import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Bars3Icon } from "@heroicons/react/24/solid";

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar pasa las props de control */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Barra Superior en Móvil (Botón Hamburguesa) */}
        <header className="lg:hidden bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md">
          <button 
            onClick={() => setOpen(true)}
            className="p-1 rounded-md hover:bg-indigo-700 transition"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="w-7 h-7" />
          </button>
          <span className="font-bold text-lg">Kioskly Admin</span>
        </header>

        {/* Contenido principal de la página */}
        <main className="flex-1 overflow-y-auto transition-all duration-300">
          <div className="p-6 md:p-8 w-full space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;