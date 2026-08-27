export const ROLE_PERMISSIONS = {
  admin: {
    dashboard: true,
    meseros: true,
    asistencia: true,
    horarios: true,
    ventas: true,
    reportes: true,
    comentarios: true,
    estadisticas: true,
    empleados: true,
  },
  supervisor: {
    dashboard: false,
    meseros: false,
    asistencia: true,
    horarios: true,
    ventas: true,
    reportes: false,
    comentarios: false,
    estadisticas: false,
    empleados: false,
  },
};