import { Router } from "express";
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from "../controllers/department.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireTenantAccess } from "../middlewares/tenantAccess.js";
import { requireTenantAdmin } from "../middlewares/tenantRoles.js";

const router = Router();

router.use(protect);
router.use(requireTenantAccess);

router.post("/", requireTenantAdmin, createDepartment);
router.put("/:id", requireTenantAdmin, updateDepartment);
router.delete("/:id", requireTenantAdmin, deleteDepartment);

router.get("/", getDepartments);

export default router;