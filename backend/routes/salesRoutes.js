// backend/routes/salesRoutes.js
import express from "express";
import { authenticateAdmin, authorizePermissions } from "../middlewares/authMiddleware.js";
import {
  getActiveSeason,
  createSeason,
  getSalesDashboard,
  getMonthlyGoals,
  saveMonthlyGoals,
  getEmployeeSales,
  registerDailySale,
  updateDailySale
} from "../controllers/salesController.js";

const router = express.Router();

// Ver temporada activa — admin, supervisor, operativo
router.get("/goals/active", authenticateAdmin, authorizePermissions('admin', 'supervisor', 'operativo'), getActiveSeason);

// Crear temporada — solo admin
router.post("/goals", authenticateAdmin, authorizePermissions('admin'), createSeason);

// Metas mensuales — admin, supervisor, operativo (solo lectura)
router.get("/monthly-goals/:month", authenticateAdmin, authorizePermissions('admin', 'supervisor', 'operativo'), getMonthlyGoals);
router.post("/monthly-goals", authenticateAdmin, authorizePermissions('admin'), saveMonthlyGoals);

// Dashboard — admin, supervisor, operativo
router.get("/dashboard", authenticateAdmin, authorizePermissions('admin', 'supervisor', 'operativo'), getSalesDashboard);

// Ventas por empleado — admin, supervisor, operativo (solo lectura)
router.get("/daily/:employee_id", authenticateAdmin, authorizePermissions('admin', 'supervisor', 'operativo'), getEmployeeSales);

// Registrar y modificar ventas — solo admin y supervisor
router.post("/daily", authenticateAdmin, authorizePermissions('admin', 'supervisor'), registerDailySale);
router.patch("/daily/:sale_id", authenticateAdmin, authorizePermissions('admin', 'supervisor'), updateDailySale);

export default router;