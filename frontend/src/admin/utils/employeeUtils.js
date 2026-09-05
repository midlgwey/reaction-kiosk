// frontend/src/admin/utils/employeeUtils.js

// Orden jerárquico definido para los puestos del restaurante
export const positionHierarchy = {
  'Capitan': 1,
  'Mesero': 2,
  'Ayudante de Mesero': 3,
  'Bartender': 4,
  'Hostess': 5,
  'Capturista': 6,
  'Limpieza': 7
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'Active':
    case 'Activo':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Suspended':
    case 'Suspendido':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Inactive':
    case 'Inactivo':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
};