// backend/controllers/scheduleController.js
import { db } from "../db.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";

// ─── GET /schedules/:week_start_date ────────────────────────────────────────
export const getWeeklySchedule = async (req, res) => {
  const { week_start_date } = req.params;

  if (!week_start_date) {
    throw new BadRequestError("La fecha de inicio de semana es obligatoria");
  }

  const weekResult = await db.execute({
    sql: `SELECT * FROM work_schedules WHERE week_start_date = ?`,
    args: [week_start_date]
  });

  if (weekResult.rows.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "No existe un horario registrado para esta semana."
    });
  }

  const workSchedule = weekResult.rows[0];

  const assignmentsResult = await db.execute({
    sql: `
      SELECT
        sa.assignment_id,
        sa.work_schedule_id,
        sa.employee_id,
        sa.shift_id,
        sa.date,
        e.first_name,
        e.last_name,
        e.position,
        e.work_area,
        st.shift_name,
        st.start_time,
        st.end_time,
        st.day_of_week
      FROM schedule_assignments sa
      JOIN employees e ON sa.employee_id = e.employee_id
      JOIN shift_types st ON sa.shift_id = st.shift_id
      WHERE sa.work_schedule_id = ?
      ORDER BY e.first_name ASC
    `,
    args: [workSchedule.work_schedule_id]
  });

  const uploadsResult = await db.execute({
    sql: `SELECT * FROM schedule_uploads WHERE work_schedule_id = ?`,
    args: [workSchedule.work_schedule_id]
  });

  res.status(StatusCodes.OK).json({
    schedule: workSchedule,
    assignments: assignmentsResult.rows,
    uploads: uploadsResult.rows
  });
};

// ─── POST /schedules ─────────────────────────────────────────────────────────
// Guarda o actualiza un borrador. Nunca toca un horario Published.
export const saveWeeklySchedule = async (req, res) => {
  const { week_start_date, week_end_date, assignments } = req.body;
  const created_by = req.user.id;

  if (!week_start_date || !week_end_date) {
    throw new BadRequestError("Las fechas de inicio y fin son obligatorias");
  }

  if (!assignments || assignments.length === 0) {
    throw new BadRequestError("Debes asignar al menos un turno antes de guardar");
  }

  // Validar formato de fechas
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(week_start_date) || !dateRegex.test(week_end_date)) {
    throw new BadRequestError("Las fechas deben tener el formato yyyy-MM-dd");
  }

  // Verificar si ya existe un horario para esta semana
  const checkWeek = await db.execute({
    sql: `SELECT * FROM work_schedules WHERE week_start_date = ?`,
    args: [week_start_date]
  });

  let workScheduleId;

  if (checkWeek.rows.length > 0) {
    const existing = checkWeek.rows[0];

    if (existing.status === 'Published') {
      throw new BadRequestError(
        "Este horario ya está publicado y no puede modificarse. Si necesitas hacer cambios, contacta al administrador."
      );
    }

    workScheduleId = existing.work_schedule_id;

    // Limpiar assignments anteriores para reescribir
    await db.execute({
      sql: `DELETE FROM schedule_assignments WHERE work_schedule_id = ?`,
      args: [workScheduleId]
    });

  } else {
    // Crear nuevo horario en Draft
    const insertWeek = await db.execute({
      sql: `
        INSERT INTO work_schedules (week_start_date, week_end_date, created_by, status)
        VALUES (?, ?, ?, 'Draft')
      `,
      args: [week_start_date, week_end_date, created_by]
    });
    workScheduleId = Number(insertWeek.lastInsertRowid);
  }

  // Validar cada assignment antes de insertar
  const validAssignments = assignments.filter(
    item => item.employee_id && item.shift_id && item.date
  );

  if (validAssignments.length === 0) {
    throw new BadRequestError("Los datos de asignación son inválidos");
  }

  // Insertar assignments en batch
  for (const item of validAssignments) {
    await db.execute({
      sql: `
        INSERT INTO schedule_assignments (work_schedule_id, employee_id, shift_id, date)
        VALUES (?, ?, ?, ?)
      `,
      args: [workScheduleId, item.employee_id, item.shift_id, item.date]
    });
  }

  res.status(StatusCodes.CREATED).json({
    message: "Borrador guardado correctamente",
    work_schedule_id: workScheduleId,
    assignments_saved: validAssignments.length
  });
};

// ─── PATCH /schedules/:work_schedule_id/publish ───────────────────────────────
export const publishWeeklySchedule = async (req, res) => {
  const { work_schedule_id } = req.params;

  if (!work_schedule_id) {
    throw new BadRequestError("El ID del horario es obligatorio");
  }

  const check = await db.execute({
    sql: `SELECT * FROM work_schedules WHERE work_schedule_id = ?`,
    args: [work_schedule_id]
  });

  if (check.rows.length === 0) {
    throw new BadRequestError("No existe el horario que intentas publicar");
  }

  if (check.rows[0].status === 'Published') {
    throw new BadRequestError("Este horario ya está publicado");
  }

  // Verificar que tenga al menos un assignment antes de publicar
  const assignmentsCheck = await db.execute({
    sql: `SELECT COUNT(*) as total FROM schedule_assignments WHERE work_schedule_id = ?`,
    args: [work_schedule_id]
  });

  const total = Number(assignmentsCheck.rows[0].total);
  if (total === 0) {
    throw new BadRequestError(
      "No puedes publicar un horario vacío. Asigna turnos antes de publicar."
    );
  }

  await db.execute({
    sql: `
      UPDATE work_schedules
      SET status = 'Published', published_date = CURRENT_TIMESTAMP
      WHERE work_schedule_id = ?
    `,
    args: [work_schedule_id]
  });

  res.status(StatusCodes.OK).json({
    message: "Horario publicado correctamente. Ya no puede editarse.",
    work_schedule_id: Number(work_schedule_id),
    assignments_published: total
  });
};

// ─── POST /schedules/:work_schedule_id/upload ─────────────────────────────────
export const uploadSchedulePdf = async (req, res) => {
  const { work_schedule_id } = req.params;
  const { upload_type } = req.body;
  const uploaded_by = req.user.id;

  if (!req.file) {
    throw new BadRequestError("No se adjuntó ningún archivo válido");
  }

  if (!upload_type) {
    throw new BadRequestError("El tipo de documento es obligatorio");
  }

  const validTypes = ['Permiso', 'Cambio de Turno', 'Incapacidad'];
  if (!validTypes.includes(upload_type)) {
    throw new BadRequestError(
      `Tipo de documento inválido. Debe ser: ${validTypes.join(', ')}`
    );
  }

  // Verificar que el horario exista
  const scheduleCheck = await db.execute({
    sql: `SELECT work_schedule_id FROM work_schedules WHERE work_schedule_id = ?`,
    args: [work_schedule_id]
  });

  if (scheduleCheck.rows.length === 0) {
    throw new BadRequestError("El horario al que intentas adjuntar el archivo no existe");
  }

  const file_name = req.file.originalname;
  // Normalizar la ruta para que funcione en cualquier OS
  const file_path = req.file.path.replace(/\\/g, '/');

  await db.execute({
    sql: `
      INSERT INTO schedule_uploads (work_schedule_id, file_name, file_path, upload_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [work_schedule_id, file_name, file_path, upload_type, uploaded_by]
  });

  res.status(StatusCodes.CREATED).json({
    message: "Archivo registrado correctamente",
    file: { file_name, file_path, upload_type }
  });
};