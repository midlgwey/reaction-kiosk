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

// Ver temporada activa
router.get("/goals/active", authenticateAdmin, authorizePermissions('admin', 'supervisor'), getActiveSeason);

// Crear temporada — solo admin
router.post("/goals", authenticateAdmin, authorizePermissions('admin'), createSeason);

// Metas mensuales
router.get("/monthly-goals/:month", authenticateAdmin, authorizePermissions('admin', 'supervisor'), getMonthlyGoals);
router.post("/monthly-goals", authenticateAdmin, authorizePermissions('admin'), saveMonthlyGoals);

// Dashboard — acepta ?month=08
router.get("/dashboard", authenticateAdmin, authorizePermissions('admin', 'supervisor'), getSalesDashboard);

// Ventas por empleado — acepta ?month=08
router.get("/daily/:employee_id", authenticateAdmin, authorizePermissions('admin', 'supervisor'), getEmployeeSales);

// Registrar y modificar ventas
router.post("/daily", authenticateAdmin, authorizePermissions('admin', 'supervisor'), registerDailySale);
router.patch("/daily/:sale_id", authenticateAdmin, authorizePermissions('admin', 'supervisor'), updateDailySale);

export default router;