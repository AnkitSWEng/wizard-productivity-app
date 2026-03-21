// /app/api/tasks/route.js
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";

export async function GET() {
  await connectDB();

  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const tasks = await Task.find({
    userId: session.user.email,
    date: today,
  });

  return Response.json(tasks);
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