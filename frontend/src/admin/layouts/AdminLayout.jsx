import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from './Sidebar';

const AdminLayout = ({ setAdmin }) => {
  const [open, setOpen] = useState(true); // controla si la sidebar está abierta

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} setAdmin={setAdmin} />

      {/* Contenido principal */}
      <div
        className="flex-1 bg-gray-100 p-6 transition-all duration-300"
        style={{ marginLeft: open ? "18rem" : "4rem" }} // Ajusta según el ancho de tu sidebar
      >
        <Outlet /> {/* Aquí se renderizan las rutas hijas */}
      </div>
    </div>
  );
};

export default AdminLayout;
