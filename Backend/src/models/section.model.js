// models/Section.js
import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
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
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
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

// Unique section name per (tenant, department, batch)
sectionSchema.index({ tenant: 1, department: 1, batch: 1, name: 1 }, { unique: true });

const Section = mongoose.model("Section", sectionSchema);
export default Section;