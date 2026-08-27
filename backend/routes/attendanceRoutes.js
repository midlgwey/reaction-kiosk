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

// Admin y Supervisor pueden ver asistencia
router.get('/shifts', authenticateAdmin, getShifts);
router.get('/employee/:employeeId', authenticateAdmin, getEmployeeAttendance);
router.get('/date/:attendanceDate', authenticateAdmin, getDateAttendance);
router.get('/range', authenticateAdmin, getRangeAttendance);
router.get('/summary/month', authenticateAdmin, getMonthSummary);

// Admin puede actualizar registros de asistencia
router.put('/update-record', authenticateAdmin, updateAttendanceRecord);

// Admin puede registrar asistencia
router.post('/check-in', authenticateAdmin,  registerCheckIn);
router.post('/check-out', authenticateAdmin,  registerCheckOut);
router.post('/absence', authenticateAdmin,  registerAbsence);
router.post('/incapacity', authenticateAdmin,  registerIncapacity);
router.put('/:attendanceId/justification', authenticateAdmin,  updateAttendanceJustification);

export default router;