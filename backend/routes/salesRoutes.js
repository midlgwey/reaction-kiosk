// backend/routes/salesRoutes.js
import express from "express";
import { authenticateAdmin, authorizePermissions } from "../middlewares/authMiddleware.js";
import {
  getActiveSeason,
  createSeason,
  getSalesDashboard,
  getEmployeeSales,
  registerDailySale,
  updateDailySale
} from "../controllers/salesController.js";

const router = express.Router();

// Ver temporada activa — admin y supervisor
router.get("/goals/active", authenticateAdmin, authorizePermissions('admin', 'supervisor'), getActiveSeason);

// Crear temporada — solo admin
router.post("/goals", authenticateAdmin, authorizePermissions('admin'), createSeason);

// Dashboard principal — admin y supervisor
router.get("/dashboard", authenticateAdmin, authorizePermissions('admin', 'supervisor'), getSalesDashboard);

// Historial de un empleado — admin y supervisor
router.get("/daily/:employee_id", authenticateAdmin, authorizePermissions('admin', 'supervisor'), getEmployeeSales);

// Registrar venta — admin y supervisor
router.post("/daily", authenticateAdmin, authorizePermissions('admin', 'supervisor'), registerDailySale);

// Modificar venta — admin y supervisor
router.patch("/daily/:sale_id", authenticateAdmin, authorizePermissions('admin', 'supervisor'), updateDailySale);

export default router;