import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from './Sidebar';

const AdminLayout = ({ setAdmin }) => {
  const [open, setOpen] = useState(true); // controla si la sidebar está abierta

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} setAdmin={setAdmin} />

      {/* Contenido principal */}
     <main className="flex-1 min-w-0 overflow-y-auto transition-all duration-300">
        
        {/* Wrapper para limitar el ancho en monitores ultra-wide (opcional pero recomendado) */}
        <div className="p-6 md:p-8 max-w-400 mx-auto space-y-6">
           <Outlet />
        </div>
        
      </main>
    </div>
  );
};

export default AdminLayout;
