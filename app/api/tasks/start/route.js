// /app/api/tasks/start/route.js
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

  // stop any active tasks
  const activeTasks = await Task.find({
    userId: session.user.email,
    isActive: true,
  });

  for (const t of activeTasks) {
    normalizeTask(t);
    t.isActive = false;
    t.startedAt = null;
    await t.save();
  }

  const task = await Task.findById(taskId);

  normalizeTask(task);

  task.isActive = true;
  task.startedAt = Date.now();

  await task.save();

  return Response.json(task);
}