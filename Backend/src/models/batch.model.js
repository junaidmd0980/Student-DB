// models/Batch.js
import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
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
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    }
  },
  { timestamps: true }
);

// Optional: unique (tenant, department, name)
batchSchema.index({ tenant: 1, department: 1, name: 1 }, { unique: true });

export default mongoose.model("Batch", batchSchema);