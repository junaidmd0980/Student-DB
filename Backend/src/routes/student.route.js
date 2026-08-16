import express from "express";
import { 
  createStudent,
  getStudents,
  getDepartmentStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from "../controllers/student.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireTenantAccess } from "../middlewares/tenantAccess.js";
import { requireTenantAdmin } from "../middlewares/tenantRoles.js";

const router = express.Router();

router.use(protect);
router.use(requireTenantAccess);

router.post("/", requireTenantAdmin, createStudent);
router.put("/:id", requireTenantAdmin, updateStudent);
router.delete("/:id", requireTenantAdmin, deleteStudent);

router.get("/", getStudents);
router.get("/department/:departmentId", getDepartmentStudents);
router.get("/:id", getStudentById);

export default router;