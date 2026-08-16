import mongoose from "mongoose";
import Tenant from "../models/tenant.model.js";

export async function requireTenantAccess(req, res, next) {
  const userId = req.user._id; 

  const tenantId =
    req.params?.tenantId ||
    req.query?.tenantId ||
    req.body?.tenantId ||
    (typeof req.get === "function" ? req.get("x-tenant-id") : undefined) ||
    req.headers?.["x-tenant-id"];

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      message: "Organization is required to select"
    });
  }

  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tenantId"
    });
  }

  const tenant = await Tenant.findOne({
    _id: new mongoose.Types.ObjectId(tenantId),
    status: "active",
    "users.user": userId
  });

  if (!tenant) {
    return res.status(403).json({
      success: false,
      message: "Access denied to this Organization"
    });
  }

  const membership = tenant.users.find(
    u => u.user.toString() === userId.toString()
  );

  req.tenant = tenant;
  req.userRole = membership?.role || "viewer";

  next();
}