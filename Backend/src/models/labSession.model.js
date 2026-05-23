import mongoose from "mongoose";

const labSessionSchema = new mongoose.Schema(
    {
        sessionName: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: String,
            required: true,
            trim: true
        },
        startTime: {
            type: String,
            required: true,
            trim: true
        },
        endTime: {
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
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: true
        },
        status: {
            type: String,
            enum: ["scheduled", "active", "closed"],
            default: "scheduled"
        },
        notes: {
            type: String,
            default: "",
            trim: true
        },
        createdBy: {
            type: String,
            default: null,
            trim: true
        },
    },
    { timestamps: true }
);

labSessionSchema.index({ department: 1, batch: 1, section: 1, data: 1 });


export default mongoose.model("LabSession", labSessionSchema);