// models/Department.js
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

// Unique department name per tenant
departmentSchema.index({ tenant: 1, name: 1 }, { unique: true });

export default mongoose.model("Department", departmentSchema);