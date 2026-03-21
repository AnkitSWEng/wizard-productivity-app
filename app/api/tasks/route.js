// /app/api/tasks/route.js
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";
import { normalizeTask } from "@/lib/normalizeTasks";

export async function GET() {
  await connectDB();

  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // fetch all user tasks
  const tasks = await Task.find({
    userId: session.user.email,
  });

  // normalize all tasks (close previous day running tasks)
  for (const task of tasks) {
    normalizeTask(task);
    await task.save();
  }

  // return only today's tasks
  const todayTasks = tasks.filter((t) => t.date === today);

  return Response.json(todayTasks);
}

export async function POST(req) {
  await connectDB();

  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();

  const task = await Task.create({
    userId: session.user.email,
    title,
    totalTimeSeconds: 0,
    isActive: false,
    startedAt: null,
    date: new Date().toISOString().slice(0, 10),
  });

  return Response.json(task);
}