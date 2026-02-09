import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function LoginAdminComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();

  const showError = (msg) => {
    setError(msg);
    setShake(true);

    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 🔥 VALIDACIONES FRONT
    if (!email || !password) {
      showError("Todos los campos son obligatorios");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      showError("Ingresa un correo válido");
      return;
    }

    setLoading(true);

    try {
      await api.post("/admin/login-admin", {
        email,
        password,
      });

      navigate("/admin/dashboard");

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Correo o contraseña incorrectos";

      showError(msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className={`
        w-full max-w-md bg-white rounded-2xl shadow-2xl 
        border border-slate-200 p-8 sm:p-10
        transition-all duration-300
        ${shake ? "animate-[shake_0.4s]" : ""}
      `}
    >
      {/* TITULO */}
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
        Panel Administrador
      </h2>

      {/* ERROR BONITO */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold text-center shadow-sm">
          {error}
        </div>
      )}

      {/* EMAIL */}
      <div className="mb-5">
        <label className="text-sm font-bold text-indigo-600">
          Correo administrador
        </label>
        <input
          type="text"
          placeholder="admin@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`
            w-full mt-1 p-3 rounded-lg border bg-slate-50
            focus:outline-none focus:ring-2 transition
            ${error ? "border-red-400 focus:ring-red-400" : "border-slate-300 focus:ring-indigo-500"}
          `}
        />
      </div>

      {/* PASSWORD */}
      <div className="mb-6">
        <label className="text-sm font-bold text-indigo-600">
          Contraseña
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`
            w-full mt-1 p-3 rounded-lg border bg-slate-50
            focus:outline-none focus:ring-2 transition
            ${error ? "border-red-400 focus:ring-red-400" : "border-slate-300 focus:ring-indigo-500"}
          `}
        />
      </div>

      {/* BOTON */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full bg-indigo-600 hover:bg-indigo-700 
          transition text-white font-bold py-3 rounded-lg shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? "Verificando..." : "Iniciar sesión"}
      </button>

      {/* FOOTER */}
      <p className="text-center text-xs text-slate-400 mt-6">
        ServiceReaction Admin Panel
      </p>

      {/* ANIMACION SHAKE */}
      <style>
        {`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-6px); }
          100% { transform: translateX(0); }
        }
        `}
      </style>
    </form>
  );
}
