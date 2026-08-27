// backend/repositories/attendance.repo.js
import { db } from '../db.js';

// Registrar entrada
export const checkIn = async (employeeId, attendanceDate, shiftId, checkInTime) => {
  const result = await db.execute({
    sql: `
      INSERT INTO attendance (employee_id, attendance_date, shift_id, check_in_time, status)
      VALUES (?, ?, ?, ?, 'Presente')
      ON CONFLICT(employee_id, attendance_date) DO UPDATE SET
        check_in_time = ?,
        shift_id = ?
    `,
    args: [employeeId, attendanceDate, shiftId, checkInTime, checkInTime, shiftId]
  });
  return result.lastInsertRowid || true;
};

// Registrar salida
export const checkOut = async (employeeId, attendanceDate, checkOutTime) => {
  const result = await db.execute({
    sql: `
      UPDATE attendance
      SET check_out_time = ?
      WHERE employee_id = ? AND attendance_date = ?
    `,
    args: [checkOutTime, employeeId, attendanceDate]
  });
  return result.rowsAffected > 0;
};

// Obtener asistencia de un empleado por rango de fechas
export const getAttendanceByEmployee = async (employeeId, startDate, endDate) => {
  const result = await db.execute({
    sql: `
      SELECT 
        a.attendance_id,
        a.employee_id,
        e.first_name,
        e.last_name,
        a.attendance_date,
        a.shift_id,
        st.shift_name,
        st.day_of_week,
        a.check_in_time,
        a.check_out_time,
        a.status,
        a.justification,
        a.created_at
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      LEFT JOIN shift_types st ON a.shift_id = st.shift_id
      WHERE a.employee_id = ? AND a.attendance_date BETWEEN ? AND ?
      ORDER BY a.attendance_date DESC
    `,
    args: [employeeId, startDate, endDate]
  });
  return result.rows;
};

// Obtener asistencia de todos los empleados en una fecha específica
export const getAttendanceByDate = async (attendanceDate) => {
  const result = await db.execute({
    sql: `
      SELECT 
        a.attendance_id,
        a.employee_id,
        e.first_name,
        e.last_name,
        e.position,
        e.work_area,
        a.attendance_date,
        a.shift_id,
        st.shift_name,
        a.check_in_time,
        a.check_out_time,
        a.status,
        a.justification
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      LEFT JOIN shift_types st ON a.shift_id = st.shift_id
      WHERE a.attendance_date = ?
      ORDER BY e.first_name ASC
    `,
    args: [attendanceDate]
  });
  return result.rows;
};

// Obtener asistencia de un rango de fechas (todos los empleados)
export const getAttendanceByDateRange = async (startDate, endDate) => {
  const result = await db.execute({
    sql: `
      SELECT 
        a.attendance_id,
        a.employee_id,
        e.first_name,
        e.last_name,
        e.position,
        e.work_area,
        a.attendance_date,
        a.shift_id,
        st.shift_name,
        a.check_in_time,
        a.check_out_time,
        a.status,
        a.justification
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.employee_id
      LEFT JOIN shift_types st ON a.shift_id = st.shift_id
      WHERE a.attendance_date BETWEEN ? AND ?
      ORDER BY a.attendance_date DESC, e.first_name ASC
    `,
    args: [startDate, endDate]
  });
  return result.rows;
};

// Marcar como falta
export const markAbsence = async (employeeId, attendanceDate, justification = null) => {
  const result = await db.execute({
    sql: `
      INSERT INTO attendance (employee_id, attendance_date, status, justification)
      VALUES (?, ?, 'Falta', ?)
      ON CONFLICT(employee_id, attendance_date) DO UPDATE SET
        status = 'Falta',
        justification = ?
    `,
    args: [employeeId, attendanceDate, justification, justification]
  });
  return result.lastInsertRowid || true;
};

// Marcar como incapacidad
export const markIncapacity = async (employeeId, attendanceDate, justification) => {
  const result = await db.execute({
    sql: `
      INSERT INTO attendance (employee_id, attendance_date, status, justification)
      VALUES (?, ?, 'Incapacidad', ?)
      ON CONFLICT(employee_id, attendance_date) DO UPDATE SET
        status = 'Incapacidad',
        justification = ?
    `,
    args: [employeeId, attendanceDate, justification, justification]
  });
  return result.lastInsertRowid || true;
};

// Obtener resumen de asistencia por mes
export const getAttendanceSummaryByMonth = async (month, year) => {
  const result = await db.execute({
    sql: `
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        COUNT(CASE WHEN a.status = 'Presente' THEN 1 END) as presentes,
        COUNT(CASE WHEN a.status = 'Falta' THEN 1 END) as faltas,
        COUNT(CASE WHEN a.status = 'Retardo' THEN 1 END) as retardos,
        COUNT(CASE WHEN a.status = 'Incapacidad' THEN 1 END) as incapacidades
      FROM employees e
      LEFT JOIN attendance a ON e.employee_id = a.employee_id
        AND strftime('%m', a.attendance_date) = ?
        AND strftime('%Y', a.attendance_date) = ?
      WHERE e.status = 'Active'
      GROUP BY e.employee_id
      ORDER BY e.first_name ASC
    `,
    args: [String(month).padStart(2, '0'), String(year)]
  });
  return result.rows;
};

// Obtener todos los turnos disponibles
export const getAllShifts = async () => {
  const result = await db.execute({
    sql: `SELECT * FROM shift_types ORDER BY shift_name ASC`
  });
  return result.rows;
};

// Actualizar justificación
export const updateJustification = async (attendanceId, justification) => {
  const result = await db.execute({
    sql: `
      UPDATE attendance
      SET justification = ?
      WHERE attendance_id = ?
    `,
    args: [justification, attendanceId]
  });
  return result.rowsAffected > 0;
};