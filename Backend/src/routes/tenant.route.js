import express from "express";
import {
  createTenant,
  getMyTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  addTenantUser,
  removeTenantUser,
  changeTenantUserRole
} from "../controllers/tenant.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createTenant);
router.get("/", protect, getMyTenants);
router.get("/:tenantId", protect, getTenantById);
router.patch("/:tenantId", protect, updateTenant);
router.delete("/:tenantId", protect, deleteTenant);

router.post("/:tenantId/users", protect, addTenantUser);
router.delete("/:tenantId/users/:userId", protect, removeTenantUser);
router.patch("/:tenantId/users/:userId/role", protect, changeTenantUserRole);

export default router;