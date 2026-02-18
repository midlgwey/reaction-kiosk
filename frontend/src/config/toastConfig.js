export const toastStyles = {
  style: {
    border: '1px solid #e2e8f0', 
    padding: '16px',
    color: '#334155',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  success: {
    iconTheme: { primary: '#4f46e5', secondary: '#fff' },
  },
  error: {
    iconTheme: { primary: '#ef4444', secondary: '#fff' },
    style: {
      border: '1px solid #ef4444', // <--- Cambio aquí: Borde rojo automático
      backgroundColor: '#fef2f2',   // Fondo sutil rojo (opcional, ayuda al contraste)
      color: '#991b1b',             // Texto en tono rojo oscuro para legibilidad
    },
  },
};