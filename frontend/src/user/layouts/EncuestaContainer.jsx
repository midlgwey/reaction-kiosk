import { Outlet } from "react-router-dom";

export default function EncuestaContainer() {
  return (
   <div className="min-h-[100dvh] overflow-hidden">

    <Outlet />

  </div>
  );
}
