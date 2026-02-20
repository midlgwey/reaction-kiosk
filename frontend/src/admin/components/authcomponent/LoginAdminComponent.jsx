import { useState } from "react";
import { useLoginAdmin } from "../../hooks/login/useLoginAdmin";
import kiosklylogo from "../../../assets/logo/kioskly-sidebar.png" // Importación del logotipo para el formulario de inicio de sesión

export default function LoginAdminComponent() {
  const {
    email, setEmail,
    password, setPassword,
    error,
    loading,
    shake,
    handleLogin
  } = useLoginAdmin();

  // Estado local para alternar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  return (
      <form
        onSubmit={handleLogin}
        className={`
          w-full max-w-md bg-white rounded-2xl shadow-2xl 
          border border-slate-200 p-8 sm:p-10
          transition-all duration-300
          ${shake ? "animate-shake" : ""}
        `}
      >
        {/* Encabezado y logotipo */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src={kiosklylogo} // Asignación de la variable importada
            alt="Kioskly Logo" 
            className="w-16 h-16 object-contain mb-3" 
          />
          <h2 className="text-2xl font-bold text-center text-indigo-600">
            Kioskly Admin
          </h2>
        </div>

        {/* Bloque de visualización de errores */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold text-center shadow-sm">
            {error}
          </div>
        )}

        {/* Campo de correo electrónico */}
        <div className="mb-5">
          <label className="text-sm font-bold text-indigo-600">
            Correo Electrónico
          </label>
          <input
            type="email"
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

        {/* Campo de contraseña con botón de visibilidad */}
        <div className="mb-6">
          <label className="text-sm font-bold text-indigo-600">
            Contraseña
          </label>
          <div className="relative mt-1">
            <input
              // Alterna entre texto plano y oculto según el estado
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`
                w-full p-3 pr-12 rounded-lg border bg-slate-50
                focus:outline-none focus:ring-2 transition
                ${error ? "border-red-400 focus:ring-red-400" : "border-slate-300 focus:ring-indigo-500"}
              `}
            />
            
            {/* Control para mostrar u ocultar la contraseña */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-indigo-600 transition"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                // Icono de ojo abierto
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                // Icono de ojo cerrado
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full bg-indigo-600 hover:bg-indigo-700 
            transition text-white font-bold py-3 rounded-lg shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            flex justify-center items-center gap-2
          "
        >
          {loading && (
            // Indicador de carga (spinner)
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? "Verificando" : "Iniciar sesión"}
        </button>

        {/* Pie del formulario */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Kioskly Admin Panel
        </p>

        {/* Definición de animación de error por retroalimentación visual */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>
      </form>
  );
}