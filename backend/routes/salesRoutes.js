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
  deleteAdminSale
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

// Registrar y modificar ventas de empleados — solo admin y supervisor
router.post("/daily", authenticateAdmin, authorizePermissions('admin', 'supervisor'), registerDailySale);
router.patch("/daily/:sale_id", authenticateAdmin, authorizePermissions('admin', 'supervisor'), updateDailySale);

// Ventas del admin — solo admin
router.post("/admin-sales", authenticateAdmin, authorizePermissions('admin'), registerAdminSale);
router.get("/admin-sales", authenticateAdmin, authorizePermissions('admin'), getAdminSales);
router.patch("/admin-sales/:admin_sale_id", authenticateAdmin, authorizePermissions('admin'), updateAdminSale);
router.delete("/admin-sales/:admin_sale_id", authenticateAdmin, authorizePermissions('admin'), deleteAdminSale);

// Meta global — solo admin
router.patch("/goals/global-goal", authenticateAdmin, authorizePermissions('admin'), updateGlobalGoal);

export default router;