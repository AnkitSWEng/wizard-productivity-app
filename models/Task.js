// /models/Task.js
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    userId: String,
    title: String,
    normalizedTitle: String, // ADD THIS
    totalTimeSeconds: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },
    startedAt: { type: Number, default: null },
    date: String,
  },
  { timestamps: true }
);

// enforce uniqueness per user + date + normalizedTitle
TaskSchema.index(
  { userId: 1, date: 1, normalizedTitle: 1 },
  { unique: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);