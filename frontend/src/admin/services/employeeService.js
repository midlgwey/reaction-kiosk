// frontend/src/admin/services/employeeService.js
import api from "./api";

// Registrar un nuevo empleado (Coincide con la ruta que funcionó en Postman)
export const createEmployeeService = async (employeeData) => {
  const response = await api.post("/employees/register-employee", employeeData);
  return response.data;
};

// Obtener la lista general de empleados
export const getEmployeesService = async () => {
  const response = await api.get("/employees");
  return response.data;
};

// Obtener un empleado por su ID
export const getEmployeeByIdService = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

// Actualizar datos de un empleado
export const updateEmployeeService = async (id, employeeData) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

// Eliminar un empleado
export const deleteEmployeeService = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};