// /app/api/tasks/pause/route.js
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";
import { normalizeTask } from "@/lib/normalizeTasks";

export async function POST(req) {
  await connectDB();

  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await req.json();

  const task = await Task.findById(taskId);

  normalizeTask(task);

  if (task.startedAt) {
    const elapsed = Math.floor((Date.now() - task.startedAt) / 1000);
    task.totalTimeSeconds += elapsed;
  }

  task.startedAt = null;
  task.isActive = false;

  await task.save();

  return Response.json(task);
}