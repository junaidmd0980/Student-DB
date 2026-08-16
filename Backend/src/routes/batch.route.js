import { Router } from "express";
import { createBatch, getBatches, updateBatch, deleteBatch } from "../controllers/batch.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireTenantAccess } from "../middlewares/tenantAccess.js";
import { requireTenantAdmin } from "../middlewares/tenantRoles.js";

const router = Router();

router.use(protect);
router.use(requireTenantAccess);

router.post("/", requireTenantAdmin, createBatch);
router.put("/:id", requireTenantAdmin, updateBatch);
router.delete("/:id", requireTenantAdmin, deleteBatch);

router.get("/", getBatches);

export default router;