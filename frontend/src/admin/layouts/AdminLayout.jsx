import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from './Sidebar';

const AdminLayout = ({ setAdmin }) => {
  const [open, setOpen] = useState(false); // controla si la sidebar está abierta

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} setAdmin={setAdmin} />

      {/* Contenedor principal con encabezado para dispositivos móviles */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Encabezado móvil */}
        <header className="lg:hidden bg-indigo-500 text-white p-4 flex items-center shadow-md z-20">
          <button 
            onClick={() => setOpen(true)}
            className="text-4xl focus:outline-none flex items-center"
          >
            <i className="bi bi-filter-left"></i>
          </button>
          <h1 className="ml-4 font-bold text-lg">Menú Admin</h1>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto transition-all duration-300">
          
          {/* Wrapper para limitar el ancho en monitores ultra-wide (opcional pero recomendado) */}
          <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
             <Outlet />
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;