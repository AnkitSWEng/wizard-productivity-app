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

  if (!title || !title.trim()) {
    return Response.json({ error: "Invalid title" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const normalizedTitle = title.trim().toLowerCase();

  try {
    const task = await Task.create({
      userId: session.user.email,
      title: title.trim(),
      normalizedTitle,
      totalTimeSeconds: 0,
      isActive: false,
      startedAt: null,
      date: today,
    });

    return Response.json(task);
  } catch (err) {
    // duplicate key error
    if (err.code === 11000) {
      return Response.json(
        { error: "Task with same name already exists" },
        { status: 400 }
      );
    }

    return Response.json({ error: "Server error" }, { status: 500 });
  }
}