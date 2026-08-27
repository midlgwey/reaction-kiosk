import { Router } from 'express';
import { registerEmployee, getEmployees, updateEmployee, deleteEmployee } from '../controllers/employeesController.js';
import { authenticateAdmin } from '../middlewares/authMiddleware.js'; // Tu middleware de auth

const router = Router();

// Ruta para obtener la lista de empleados (protegida por autenticación)
router.get('/', authenticateAdmin, getEmployees);

// Protegemos la ruta para que solo usuarios autenticados creen empleados
router.post('/register-employee', authenticateAdmin, registerEmployee);

// Ruta para actualizar un empleado por ID (protegida por autenticación)
router.put('/:id', authenticateAdmin, updateEmployee);

// Ruta para eliminar un empleado por ID (protegida por autenticación)
router.delete('/:id', authenticateAdmin, deleteEmployee);

export default router;