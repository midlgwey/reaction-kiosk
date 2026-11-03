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
  updateDailySale,
  updateGlobalGoal,
  registerAdminSale,
  getAdminSales,
  updateAdminSale,
  deleteAdminSale,
  requireActiveSeason
} from "../controllers/salesController.js";

const router = express.Router();

// Ver temporada activa — admin, supervisor, operativo
router.get("/goals/active", authenticateAdmin, authorizePermissions('admin', 'supervisor', 'operativo'), getActiveSeason);

// Crear temporada — solo admin (sin requireActiveSeason, para poder crear la siguiente temporada)
router.post("/goals", authenticateAdmin, authorizePermissions('admin'), createSeason);

// Metas mensuales — admin, supervisor, operativo (solo lectura)
router.get("/monthly-goals/:month", authenticateAdmin, authorizePermissions('admin', 'supervisor', 'operativo'), getMonthlyGoals);
router.post("/monthly-goals", authenticateAdmin, authorizePermissions('admin'), requireActiveSeason, saveMonthlyGoals);

// Dashboard — admin, supervisor, operativo
router.get("/dashboard", authenticateAdmin, authorizePermissions('admin', 'supervisor', 'operativo'), getSalesDashboard);

// Ventas por empleado — admin, supervisor, operativo (solo lectura)
router.get("/daily/:employee_id", authenticateAdmin, authorizePermissions('admin', 'supervisor', 'operativo'), getEmployeeSales);

// Registrar y modificar ventas de empleados — solo admin y supervisor
router.post("/daily", authenticateAdmin, authorizePermissions('admin', 'supervisor'), requireActiveSeason, registerDailySale);
router.patch("/daily/:sale_id", authenticateAdmin, authorizePermissions('admin', 'supervisor'), requireActiveSeason, updateDailySale);

// Ventas del admin — solo admin
router.post("/admin-sales", authenticateAdmin, authorizePermissions('admin'), requireActiveSeason, registerAdminSale);
router.get("/admin-sales", authenticateAdmin, authorizePermissions('admin'), getAdminSales);
router.patch("/admin-sales/:admin_sale_id", authenticateAdmin, authorizePermissions('admin'), requireActiveSeason, updateAdminSale);
router.delete("/admin-sales/:admin_sale_id", authenticateAdmin, authorizePermissions('admin'), requireActiveSeason, deleteAdminSale);

// Meta global — solo admin
router.patch("/goals/global-goal", authenticateAdmin, authorizePermissions('admin'), requireActiveSeason, updateGlobalGoal);

export default router;