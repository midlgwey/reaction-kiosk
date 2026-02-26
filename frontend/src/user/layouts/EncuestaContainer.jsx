import { Outlet } from "react-router-dom";

export default function EncuestaContainer() {
  return (
   <div className="min-h-screen flex items-center justify-center p-4 md:p-10">

    <Outlet />

  </div>
  );
}
