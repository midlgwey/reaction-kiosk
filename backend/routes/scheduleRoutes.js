// backend/routes/scheduleRoutes.js
import express from "express";
import { authenticateAdmin, authorizePermissions } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { 
  getWeeklySchedule, 
  saveWeeklySchedule, 
  publishWeeklySchedule,
  getScheduleEmployees, 
  uploadSchedulePdf 
} from "../controllers/scheduleController.js";

const router = express.Router();


// Ruta para obtener la lista de empleados activos (protegida por autenticación y autorización)
router.get("/employees-activates", authenticateAdmin, authorizePermissions('admin'), getScheduleEmployees);

// ruta para obtener el horario semanal — admin, supervisor, operativo
router.get("/:week_start_date", authenticateAdmin, authorizePermissions('admin', 'supervisor', 'operativo'), getWeeklySchedule);

// Solo el Admin puede crear, publicar y subir PDFs
router.post("/", authenticateAdmin, authorizePermissions('admin'), saveWeeklySchedule);
router.patch("/:work_schedule_id/publish", authenticateAdmin, authorizePermissions('admin'), publishWeeklySchedule);

// Importar el middleware de subida de archivos
router.post("/:work_schedule_id/upload", authenticateAdmin, authorizePermissions('admin'), upload.single('file'), uploadSchedulePdf);

export default router;