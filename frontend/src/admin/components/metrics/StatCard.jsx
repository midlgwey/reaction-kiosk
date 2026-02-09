

export default function StatCard({ title, value, subtitle, icon, change }) {
  return (
   
    <div className="bg-indigo-100 sm:p-4 p-6 lg:p-8 rounded-4xl border border-slate-300  flex flex-col justify-between shadow-sm">
      
      {/*Titulo/Icono*/}
      <div className="flex justify-between items-start">
        
        <p className="text-indigo-800 text-xs md:text-xs lg:text-sm font-bold truncate">{title}</p>
        {icon && (
           <div className="p-2 sm:p-3 rounded-lg flex items-center justify-center ">
            {icon}
          </div>
        )}
      </div>

      
      {/* Valor principal */}
      <div className="mt-3 md:mt-4">
        <h3 className="text-lg md:text-xl lg:text-3xl font-extrabold text-slate-900 truncate">{value}</h3>

        {/* Subtítulo opcional */}
        {subtitle && (
          <p className="text-slate-800 text-xs md:text-xs lg:text-sm font-semibold mt-1 truncate">{subtitle}</p>
        )}

        {/* Cambio porcentual opcional */}
        {change && (
          <p
            className={`mt-1 text-xs sm:text-sm font-semibold truncate ${
              change.startsWith('+') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {change} respecto al mes anterior
          </p>
        )}
      </div>
    </div>
  );
}