// backend/routes/attendanceRoutes.js
import express from 'express';
import { authenticateAdmin, authorizePermissions } from '../middlewares/authMiddleware.js';
import {
  registerCheckIn,
  registerCheckOut,
  getEmployeeAttendance,
  getDateAttendance,
  getRangeAttendance,
  registerAbsence,
  registerIncapacity,
  getMonthSummary,
  getShifts,
  updateAttendanceJustification,
  updateAttendanceRecord
} from '../controllers/attendanceController.js';

const router = express.Router();

// Rutas para obtener registros de asistencia
router.get('/shifts', authenticateAdmin, getShifts);
router.get('/employee/:employeeId', authenticateAdmin, getEmployeeAttendance);
router.get('/date/:attendanceDate', authenticateAdmin, getDateAttendance);
router.get('/range', authenticateAdmin, getRangeAttendance);
router.get('/summary/month', authenticateAdmin, getMonthSummary);

// Ruta para actualizar un registro de asistencia existente
router.put('/update-record', authenticateAdmin, updateAttendanceRecord);

// Rutas para registrar asistencia, ausencias e incapacidades
router.post('/check-in', authenticateAdmin,  registerCheckIn);
router.post('/check-out', authenticateAdmin,  registerCheckOut);
router.post('/absence', authenticateAdmin,  registerAbsence);
router.post('/incapacity', authenticateAdmin,  registerIncapacity);
router.put('/:attendanceId/justification', authenticateAdmin,  updateAttendanceJustification);

export default router;