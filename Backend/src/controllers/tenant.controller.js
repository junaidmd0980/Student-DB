import Tenant from "../models/tenant.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// ---------- HELPERS ----------

function isAdminOfTenant(tenant, userId) {
  return tenant.admins.some(a => a.user.toString() === userId.toString());
}

function isUserInTenant(tenant, userId) {
  return tenant.users.some(u => u.user.toString() === userId.toString());
}

// ---------- CRUD ----------

// CREATE tenant
export const createTenant = async (req, res) => {
  try {
    const { baseName } = req.body;
    const creatorId = req.user._id;

    if (!baseName || !baseName.trim()) {
      return res.status(400).json({
        success: false,
        message: "baseName is required"
      });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(403).json({
        success: false,
        message: "Invalid or inactive user"
      });
    }

    const tenant = await Tenant.create({
      baseName: baseName.trim(),
      createdBy: creatorId,
      users: [
        {
          user: creatorId,
          role: "admin"
        }
      ],
      admins: [
        {
          user: creatorId
        }
      ],
      status: "active"
    });

    res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: tenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET all tenants the current user can view
export const getMyTenants = async (req, res) => {
  try {
    const userId = req.user._id;
  
    const tenants = await Tenant.find({
      "users.user": userId,
      status: { $in: ["active", "inactive"] }
    })
      .select("baseName status createdBy createdAt updatedAt users admins")
      .populate("users.user", "username email")
      .populate("admins.user", "username email")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: tenants.length,
      data: tenants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET single tenant by ID (with users & admins)
export const getTenantById = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant id"
      });
    }

    const tenant = await Tenant.findOne({
      _id: tenantId,
      "users.user": userId
    })
      .populate("users.user", "username email")
      .populate("admins.user", "username email")
      .populate("createdBy", "username email");

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE tenant basic fields (baseName, status)
// Only admins can update
export const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { baseName, status } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant id"
      });
    }

    const tenant = await Tenant.findOne({
      _id: tenantId,
      "users.user": userId
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found or access denied"
      });
    }

    if (!isAdminOfTenant(tenant, userId)) {
      return res.status(403).json({
        success: false,
        message: "Only tenant admins can update tenant"
      });
    }

    if (baseName !== undefined) {
      if (!baseName || !baseName.trim()) {
        return res.status(400).json({
          success: false,
          message: "baseName cannot be empty"
        });
      }
      tenant.baseName = baseName.trim();
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value"
        });
      }
      tenant.status = status;
    }

    await tenant.save();

    const populated = await Tenant.findById(tenant._id)
      .populate("users.user", "username email")
      .populate("admins.user", "username email")
      .populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE tenant – only creator can delete
export const deleteTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant id"
      });
    }

    const tenant = await Tenant.findOne({
      _id: tenantId,
      "users.user": userId
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found or access denied"
      });
    }

    const isCreator = tenant.createdBy.toString() === userId.toString();

    if (!isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can delete this tenant"
      });
    }

    await Tenant.findByIdAndDelete(tenantId);

    res.status(200).json({
      success: true,
      message: "Tenant deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ---------- USER MANAGEMENT INSIDE TENANT ----------

// ADD user to tenant (with role)
// Only admins can add users
export const addTenantUser = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { userId, identifier, role } = req.body;
    const rawIdentifier = userId || identifier;
    const actorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tenantId) || !rawIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant id or user identifier"
      });
    }

    if (!role || !["admin", "faculty", "viewer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const tenant = await Tenant.findOne({
      _id: tenantId,
      "users.user": actorId
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found or access denied"
      });
    }

    if (!isAdminOfTenant(tenant, actorId)) {
      return res.status(403).json({
        success: false,
        message: "Only tenant admins can add users"
      });
    }

    let user = null;
    if (mongoose.Types.ObjectId.isValid(rawIdentifier)) {
      user = await User.findById(rawIdentifier);
    }

    if (!user && typeof rawIdentifier === "string") {
      const normalized = rawIdentifier.trim();
      if (normalized.includes("@")) {
        user = await User.findOne({ email: normalized.toLowerCase() });
      } else {
        user = await User.findOne({ username: normalized });
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const existing = tenant.users.find(u => u.user.toString() === user._id.toString());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists in this tenant"
      });
    }

    tenant.users.push({
      user: user._id,
      role,
      addedAt: Date.now()
    });

    // If role is admin, also add to admins if not present
    if (role === "admin") {
      const alreadyAdmin = tenant.admins.some(a => a.user.toString() === user._id.toString());
      if (!alreadyAdmin) {
        tenant.admins.push({
          user: user._id,
          addedAt: Date.now()
        });
      }
    }

    await tenant.save();

    const populated = await Tenant.findById(tenant._id)
      .populate("users.user", "username email")
      .populate("admins.user", "username email")
      .populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: "User added to tenant successfully",
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// REMOVE user from tenant
// Only admins can remove users
export const removeTenantUser = async (req, res) => {
  try {
    const { tenantId, userId } = req.params;
    const actorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tenantId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant id or user id"
      });
    }

    const tenant = await Tenant.findOne({
      _id: tenantId,
      "users.user": actorId
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found or access denied"
      });
    }

    if (!isAdminOfTenant(tenant, actorId)) {
      return res.status(403).json({
        success: false,
        message: "Only tenant admins can remove users"
      });
    }

    const targetId = userId;

    // Prevent removing the last admin (basic safety)
    const targetIsAdmin = tenant.admins.some(a => a.user.toString() === targetId);
    if (targetIsAdmin) {
      const adminCount = tenant.admins.length;
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove the last admin from tenant"
        });
      }
    }

    tenant.users = tenant.users.filter(u => u.user.toString() !== targetId);
    tenant.admins = tenant.admins.filter(a => a.user.toString() !== targetId);

    await tenant.save();

    const populated = await Tenant.findById(tenant._id)
      .populate("users.user", "username email")
      .populate("admins.user", "username email")
      .populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: "User removed from tenant successfully",
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// CHANGE user role in tenant
// Only admins can change roles
export const changeTenantUserRole = async (req, res) => {
  try {
    const { tenantId, userId } = req.params;
    const { role } = req.body;
    const actorId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(tenantId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant id or user id"
      });
    }

    if (!role || !["admin", "faculty", "viewer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const tenant = await Tenant.findOne({
      _id: tenantId,
      "users.user": actorId
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found or access denied"
      });
    }

    if (!isAdminOfTenant(tenant, actorId)) {
      return res.status(403).json({
        success: false,
        message: "Only tenant admins can change user roles"
      });
    }

    const membership = tenant.users.find(u => u.user.toString() === userId);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "User not found in this tenant"
      });
    }

    membership.role = role;

    // Sync admins array if role becomes admin / stops being admin
    const alreadyAdmin = tenant.admins.some(a => a.user.toString() === userId);

    if (role === "admin" && !alreadyAdmin) {
      tenant.admins.push({
        user: userId,
        addedAt: Date.now()
      });
    } else if (role !== "admin" && alreadyAdmin) {
      // Prevent removing last admin
      if (tenant.admins.length <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove the last admin from tenant"
        });
      }
      tenant.admins = tenant.admins.filter(a => a.user.toString() !== userId);
    }

    await tenant.save();

    const populated = await Tenant.findById(tenant._id)
      .populate("users.user", "username email")
      .populate("admins.user", "username email")
      .populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};