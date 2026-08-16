// models/Tenant.js
import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    baseName: {
      type: String,
      required: true,
      trim: true
      // NOT unique, multiple tenants can share the same baseName
    },

    // Optional: a human-friendly code if you still want it
    // code: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true
    // },

    // Users who can access this tenant (feature routes)
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        // Optional: tenant-level role (viewer, faculty, admin-like)
        role: {
          type: String,
          enum: ["viewer", "faculty", "admin"],
          default: "viewer"
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // Admins who can manage tenant settings, users, etc.
    admins: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // Creator of the tenant (full access, always considered an admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

// Indexes for efficient checks
tenantSchema.index({ "users.user": 1 });
tenantSchema.index({ "admins.user": 1 });
tenantSchema.index({ createdBy: 1 });

const Tenant = mongoose.model("Tenant", tenantSchema);
export default Tenant;