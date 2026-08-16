// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },
    rollNo: {
      type: String,
      required: [true, "Roll number is required"],
      trim: true
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"]
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: [true, "Batch is required"]
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section is required"]
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

// Roll number unique per tenant
studentSchema.index({ tenant: 1, rollNo: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;