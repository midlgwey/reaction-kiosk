// frontend/src/admin/hooks/employees/useEmployees.js 
import { useState, useCallback } from 'react';
import {
  getEmployeesService,
  createEmployeeService,
  updateEmployeeService,
  deleteEmployeeService
} from '../../services/employeeService';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployeesService();
      setEmployees(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, []);

  const addEmployee = async (employeeData) => {
    setLoading(true);
    try {
      await createEmployeeService(employeeData);
      await fetchEmployees();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al registrar el empleado';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id, employeeData) => {
    setLoading(true);
    try {
      await updateEmployeeService(id, employeeData);
      await fetchEmployees();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al actualizar el empleado';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const removeEmployee = async (id) => {
    setLoading(true);
    try {
      await deleteEmployeeService(id);
      setEmployees((prev) => prev.filter((emp) => emp.employee_id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Error al eliminar el empleado';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    removeEmployee
  };
};