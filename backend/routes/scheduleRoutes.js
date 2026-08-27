// backend/routes/scheduleRoutes.js
import express from "express";
import { authenticateAdmin, authorizePermissions } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { 
  getWeeklySchedule, 
  saveWeeklySchedule, 
  publishWeeklySchedule, 
  uploadSchedulePdf 
} from "../controllers/scheduleController.js";

const router = express.Router();

// Admin y Supervisor pueden ver el horario
router.get("/:week_start_date", authenticateAdmin, authorizePermissions('admin', 'supervisor'), getWeeklySchedule);

// Solo el Admin puede crear, publicar y subir PDFs
router.post("/", authenticateAdmin, authorizePermissions('admin'), saveWeeklySchedule);
router.patch("/:work_schedule_id/publish", authenticateAdmin, authorizePermissions('admin'), publishWeeklySchedule);

// Importar el middleware de subida de archivos
router.post("/:work_schedule_id/upload", authenticateAdmin, authorizePermissions('admin'), upload.single('file'), uploadSchedulePdf);

export default router;