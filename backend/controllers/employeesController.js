// backend/controllers/employeesController.js
import { db } from "../db.js";
import { StatusCodes } from "http-status-codes";
import { 
  createEmployee, 
  getAllEmployees,
  updateEmployee as updateEmployeeRepo,  
  deleteEmployee as deleteEmployeeRepo   
} from "../repositories/employee.repo.js";
import { BadRequestError } from "../errors/customErrors.js";

export const registerEmployee = async (req, res) => {
  const { first_name, last_name, phone_number, position, work_area, hire_date, status } = req.body;

  if (!first_name || !last_name) {
    throw new BadRequestError("El nombre y el apellido son obligatorios");
  }

  const employeeId = await createEmployee({
    first_name,
    last_name,
    phone_number,
    position,
    work_area,
    hire_date,
    status
  });

  res.status(StatusCodes.CREATED).json({
    message: "Empleado registrado exitosamente",
    employeeId: Number(employeeId)
  });
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await getAllEmployees(); 
    
    res.status(StatusCodes.OK).json(employees);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Error al cargar los empleados" 
    });
  }
};

// Función para actualizar un empleado
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number, position, work_area, hire_date, status } = req.body;

  if (!first_name || !last_name) {
    throw new BadRequestError("El nombre y el apellido son obligatorios");
  }

  const rowsAffected = await updateEmployeeRepo(id, {
    first_name,
    last_name,
    phone_number,
    position,
    work_area,
    hire_date,
    status
  });

  if (rowsAffected === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Empleado no encontrado" });
  }

  res.status(StatusCodes.OK).json({
    message: "Empleado actualizado exitosamente"
  });
};

// Función para eliminar un empleado
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  const rowsAffected = await deleteEmployeeRepo(id);

  if (rowsAffected === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Empleado no encontrado" });
  }

  res.status(StatusCodes.OK).json({
    message: "Empleado eliminado exitosamente"
  });
};