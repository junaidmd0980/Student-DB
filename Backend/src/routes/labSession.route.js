// routes/labSession.router.js
import express from "express";
import {
  createLabSession,
  getLabSessions,
  getLabSessionById,
  updateLabSession,
  deleteLabSession,
  markLabAttendance,
  removeLabAttendance,
  updateLabSessionStatus
} from "../controllers/labSession.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireTenantAccess } from "../middlewares/tenantAccess.js";
import { requireTenantFacultyOrAbove } from "../middlewares/tenantRoles.js";

const router = express.Router();

router.use(protect);
router.use(requireTenantAccess);

router.post("/", requireTenantFacultyOrAbove, createLabSession);
router.put("/:sessionId", requireTenantFacultyOrAbove, updateLabSession);
router.delete("/:sessionId", requireTenantFacultyOrAbove, deleteLabSession);

router.post("/:sessionId/attendance", requireTenantFacultyOrAbove, markLabAttendance);
router.delete("/:sessionId/attendance/:studentId", requireTenantFacultyOrAbove, removeLabAttendance);
router.patch("/:sessionId/status", requireTenantFacultyOrAbove, updateLabSessionStatus);

router.get("/", getLabSessions);
router.get("/:sessionId", getLabSessionById);

export default router;