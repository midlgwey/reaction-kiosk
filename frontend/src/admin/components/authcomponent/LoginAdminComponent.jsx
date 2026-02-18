import { useLoginAdmin } from "../../hooks/login/useLoginAdmin";

export default function LoginAdminComponent() {
  
 const {
    email, setEmail,
    password, setPassword,
    error,
    loading,
    shake,
    handleLogin
  } = useLoginAdmin();

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
            type="email" // Cambiado a type email para ayuda nativa del navegador
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
            flex justify-center items-center gap-2
          "
        >
          {loading && (
            // Spinner SVG simple
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? "Verificando" : "Iniciar sesión"}
        </button>

        {/* FOOTER */}
        <p className="text-center text-xs text-slate-400 mt-6">
          ServiceReaction Admin Panel
        </p>

        {/* ESTILOS DE ANIMACIÓN */}
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