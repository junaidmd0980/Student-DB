// middleware/tenantRoles.js
export function requireTenantAdmin(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }
  next();
}

export function requireTenantFacultyOrAbove(req, res, next) {
  if (!["admin", "faculty"].includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: "Faculty or admin access required"
    });
  }
  next();
}