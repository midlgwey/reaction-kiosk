import { Outlet } from "react-router-dom";

export default function EncuestaContainer() {
  return (
    <div className="
      min-h-screen 
      bg-linear-to-br from-slate-50 to-gray-100
      flex items-center justify-center
      overflow-hidden
      p-4 md:p-10
    ">
      <div className="w-full max-w-7xl">
        <Outlet />
      </div>
    </div>
  );
}
