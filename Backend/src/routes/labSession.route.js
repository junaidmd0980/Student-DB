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

const router = express.Router();

router.post("/", createLabSession);
router.get("/", getLabSessions);
router.get("/:sessionId", getLabSessionById);
router.put("/:sessionId", updateLabSession);
router.delete("/:sessionId", deleteLabSession);
router.post("/:sessionId/attendance", markLabAttendance);
router.delete("/:sessionId/attendance/:studentId", removeLabAttendance);
router.patch("/:sessionId/status", updateLabSessionStatus);

export default router;