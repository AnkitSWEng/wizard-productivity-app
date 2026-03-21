 import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  userId: String,
  title: String,
  totalTimeSeconds: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
  startedAt: { type: Number, default: null },
  date: String
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);