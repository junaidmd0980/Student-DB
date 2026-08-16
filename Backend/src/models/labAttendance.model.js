// models/LabAttendance.js
import mongoose from "mongoose";

const labAttendanceSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabSession",
      required: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    method: {
      type: String,
      enum: ["manual", "scanner"],
      default: "scanner"
    },
    markedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

labAttendanceSchema.index({ tenant: 1, session: 1, student: 1 }, { unique: true });
labAttendanceSchema.index({ tenant: 1, session: 1, rollNo: 1 }, { unique: true });
labAttendanceSchema.index({ tenant: 1, session: 1, markedAt: 1 });

export default mongoose.model("LabAttendance", labAttendanceSchema);