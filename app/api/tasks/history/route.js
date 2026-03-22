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

  if (!date) {
    return Response.json({ error: "Date required" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // block future dates
  if (date > today) {
    return Response.json({ error: "Future date not allowed" }, { status: 400 });
  }

  const tasks = await Task.find({
    userId: session.user.email,
    date,
  });

  return Response.json(tasks);
}