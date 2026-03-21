// /app/api/tasks/start/route.js
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";

export async function POST(req) {
  await connectDB();
  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await req.json();

  // ensure only one active task per user
  await Task.updateMany(
    { userId: session.user.email, isActive: true },
    { isActive: false, startedAt: null }
  );

  const task = await Task.findById(taskId);

  task.isActive = true;
  task.startedAt = Date.now();

  await task.save();

  return Response.json(task);
}