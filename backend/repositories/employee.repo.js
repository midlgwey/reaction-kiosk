// backend/repositories/employee.repo.js
import { db } from '../db.js';

export const createEmployee = async ({
  first_name,
  last_name,
  phone_number,
  position,
  work_area,
  hire_date,
  status = 'Active'
}) => {
  const result = await db.execute({
    sql: `
      INSERT INTO employees (first_name, last_name, phone_number, position, work_area, hire_date, status)
      VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?)
    `,
    args: [
      first_name,
      last_name,
      phone_number || null,
      position || null,
      work_area || null,
      hire_date || null,
      status
    ],
  });

  return result.lastInsertRowid;
};

// Todos los empleados — para el panel de administración (incluye inactivos)
export const getAllEmployees = async () => {
  const result = await db.execute("SELECT * FROM employees ORDER BY first_name ASC");
  return result.rows;
};

// Solo empleados activos — para el módulo de horarios
export const getActiveEmployees = async () => {
  const result = await db.execute(
    "SELECT * FROM employees WHERE status = 'Active' ORDER BY first_name ASC"
  );
  return result.rows;
};

// Función para actualizar un empleado
export const updateEmployee = async (id, {
  first_name,
  last_name,
  phone_number,
  position,
  work_area,
  hire_date,
  status
}) => {
  const result = await db.execute({
    sql: `
      UPDATE employees 
      SET first_name = ?, last_name = ?, phone_number = ?, position = ?, work_area = ?, hire_date = ?, status = ?
      WHERE employee_id = ?
    `,
    args: [
      first_name,
      last_name,
      phone_number || null,
      position || null,
      work_area || null,
      hire_date || null,
      status || 'Active',
      id
    ],
  });

  return result.rowsAffected;
};

// Función para eliminar un empleado por su ID
export const deleteEmployee = async (id) => {
  const result = await db.execute({
    sql: `DELETE FROM employees WHERE employee_id = ?`,
    args: [id],
  });

  return result.rowsAffected;
};