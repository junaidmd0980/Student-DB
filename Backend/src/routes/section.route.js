import { Router } from "express";
import { createSection, getSections, updateSection, deleteSection } from "../controllers/section.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireTenantAccess } from "../middlewares/tenantAccess.js";
import { requireTenantAdmin } from "../middlewares/tenantRoles.js";

const router = Router();

router.use(protect);
router.use(requireTenantAccess);

router.post("/", requireTenantAdmin, createSection);
router.put("/:id", requireTenantAdmin, updateSection);
router.delete("/:id", requireTenantAdmin, deleteSection);

router.get("/", getSections);

export default router;