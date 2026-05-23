import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
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
}, { timestamps: true });

export default mongoose.model("Batch", batchSchema);