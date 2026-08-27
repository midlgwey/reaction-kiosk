// backend/controllers/attendanceController.js
import { StatusCodes } from 'http-status-codes';
import { db } from '../db.js';
import {
  checkIn,
  checkOut,
  getAttendanceByEmployee,
  getAttendanceByDate,
  getAttendanceByDateRange,
  markAbsence,
  markIncapacity,
  getAttendanceSummaryByMonth,
  getAllShifts,
  updateJustification
} from '../repositories/attendance.repo.js';
import { BadRequestError } from '../errors/customErrors.js';

// Marcar entrada
export const registerCheckIn = async (req, res) => {
  const { employeeId, attendanceDate, shiftId, checkInTime } = req.body;

  if (!employeeId || !attendanceDate || !shiftId || !checkInTime) {
    throw new BadRequestError('Faltan campos requeridos');
  }

  await checkIn(employeeId, attendanceDate, shiftId, checkInTime);

  res.status(StatusCodes.CREATED).json({
    message: 'Entrada registrada exitosamente'
  });
};

// Marcar salida
export const registerCheckOut = async (req, res) => {
  const { employeeId, attendanceDate, checkOutTime } = req.body;

  if (!employeeId || !attendanceDate || !checkOutTime) {
    throw new BadRequestError('Faltan campos requeridos');
  }

  const success = await checkOut(employeeId, attendanceDate, checkOutTime);

  if (!success) {
    throw new BadRequestError('No se pudo registrar la salida');
  }

  res.status(StatusCodes.OK).json({
    message: 'Salida registrada exitosamente'
  });
};

// Obtener asistencia de un empleado
export const getEmployeeAttendance = async (req, res) => {
  const { employeeId } = req.params;
  const { startDate, endDate } = req.query;

  if (!employeeId || !startDate || !endDate) {
    throw new BadRequestError('Faltan parámetros requeridos');
  }

  const attendance = await getAttendanceByEmployee(employeeId, startDate, endDate);

  res.status(StatusCodes.OK).json(attendance);
};

// Obtener asistencia de una fecha específica
export const getDateAttendance = async (req, res) => {
  const { attendanceDate } = req.params;

  if (!attendanceDate) {
    throw new BadRequestError('Fecha requerida');
  }

  const attendance = await getAttendanceByDate(attendanceDate);

  res.status(StatusCodes.OK).json(attendance);
};

// Obtener asistencia por rango de fechas
export const getRangeAttendance = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new BadRequestError('Rango de fechas requerido');
  }

  const attendance = await getAttendanceByDateRange(startDate, endDate);

  res.status(StatusCodes.OK).json(attendance);
};

// Marcar falta
export const registerAbsence = async (req, res) => {
  const { employeeId, attendanceDate, justification } = req.body;

  if (!employeeId || !attendanceDate) {
    throw new BadRequestError('Faltan campos requeridos');
  }

  await markAbsence(employeeId, attendanceDate, justification || null);

  res.status(StatusCodes.CREATED).json({
    message: 'Falta registrada exitosamente'
  });
};

// Marcar incapacidad
export const registerIncapacity = async (req, res) => {
  const { employeeId, attendanceDate, justification } = req.body;

  if (!employeeId || !attendanceDate || !justification) {
    throw new BadRequestError('Faltan campos requeridos');
  }

  await markIncapacity(employeeId, attendanceDate, justification);

  res.status(StatusCodes.CREATED).json({
    message: 'Incapacidad registrada exitosamente'
  });
};

// Obtener resumen mensual
export const getMonthSummary = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    throw new BadRequestError('Mes y año requeridos');
  }

  const summary = await getAttendanceSummaryByMonth(month, year);

  res.status(StatusCodes.OK).json(summary);
};

// Obtener todos los turnos
export const getShifts = async (req, res) => {
  const shifts = await getAllShifts();

  res.status(StatusCodes.OK).json(shifts);
};

// Actualizar justificación
export const updateAttendanceJustification = async (req, res) => {
  const { attendanceId } = req.params;
  const { justification } = req.body;

  if (!attendanceId || !justification) {
    throw new BadRequestError('Faltan campos requeridos');
  }

  const success = await updateJustification(attendanceId, justification);

  if (!success) {
    throw new BadRequestError('No se pudo actualizar la justificación');
  }

  res.status(StatusCodes.OK).json({
    message: 'Justificación actualizada exitosamente'
  });
};

// Actualizar o Insertar registro de asistencia (UPSERT)
export const updateAttendanceRecord = async (req, res) => {
  const { employeeId, attendanceDate, checkInTime, checkOutTime, status, justification } = req.body;

  if (!employeeId || !attendanceDate) {
    throw new BadRequestError('Faltan campos requeridos');
  }

  await db.execute({
    sql: `
      INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, status, justification)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(employee_id, attendance_date) DO UPDATE SET 
        check_in_time = excluded.check_in_time,
        check_out_time = excluded.check_out_time,
        status = excluded.status,
        justification = excluded.justification
    `,
    args: [
      employeeId, 
      attendanceDate, 
      checkInTime || null, 
      checkOutTime || null, 
      status || 'Presente', 
      justification || null
    ]
  });

  res.status(StatusCodes.OK).json({
    message: 'Asistencia actualizada correctamente'
  });
};