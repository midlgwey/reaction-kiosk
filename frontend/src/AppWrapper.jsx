import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import App from "./App";
import { setNavigator } from "./admin/services/navigation";

export default function AppWrapper() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate); // 🔥 conecta interceptor con React Router
  }, [navigate]);

  return <App />;
}
