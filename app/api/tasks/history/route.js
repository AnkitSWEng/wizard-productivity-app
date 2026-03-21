// /app/api/tasks/history/route.js
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";

export async function GET(req) {
  await connectDB();
  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const tasks = await Task.find({
    userId: session.user.email,
    date,
  });

  return Response.json(tasks);
}