// /app/dashboard/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Task = {
  _id: string;
  title: string;
  totalTimeSeconds: number;
  isActive: boolean;
  startedAt: number | null;
};

export default function DashboardPage(): JSX.Element {
  const { status } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [history, setHistory] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [, forceUpdate] = useState(0);
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    if (status === "authenticated") {
      fetchTasks();
    }
  }, [status, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function fetchTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();

    if (Array.isArray(data)) {
      setTasks(data);
    } else {
      setTasks([]);
    }
  }

  async function addTask() {
  if (!title.trim()) return;

  setTaskError("");

  const res = await fetch("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  const data = await res.json();

  if (!res.ok) {
    setTaskError(data.error || "Failed to add task");
    return;
  }

  setTitle("");
  fetchTasks();
}

  async function startTask(taskId: string) {
    await fetch("/api/tasks/start", {
      method: "POST",
      body: JSON.stringify({ taskId }),
    });
    fetchTasks();
  }

  async function pauseTask(taskId: string) {
    await fetch("/api/tasks/pause", {
      method: "POST",
      body: JSON.stringify({ taskId }),
    });
    fetchTasks();
  }

  function getLiveTime(task: Task) {
    if (!task.startedAt) return task.totalTimeSeconds;

    const live = Math.floor((Date.now() - task.startedAt) / 1000);
    return task.totalTimeSeconds + live;
  }

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h}h ${m}m ${s}s`;
  }

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-xl mb-4">Tasks</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-2 py-1"
          placeholder="New task"
        />
        <button onClick={addTask} className="bg-black text-white px-3">
          Add
        </button>
      </div>
      {taskError && (
  <div className="text-red-500 mt-2">{taskError}</div>
)}

      <ul className="space-y-3">
        {tasks.map((t) => (
          <li
            key={t._id}
            className="border p-3 flex justify-between items-center"
          >
            <div>
              <div>{t.title}</div>
              <div className="text-sm text-gray-500">
                {formatTime(getLiveTime(t))}
              </div>
            </div>

            <div>
              {t.isActive ? (
                <button
                  onClick={() => pauseTask(t._id)}
                  className="bg-yellow-500 px-3 py-1 text-white"
                >
                  Pause
                </button>
              ) : t.totalTimeSeconds > 0 ? (
                <button
                  onClick={() => startTask(t._id)}
                  className="bg-blue-600 px-3 py-1 text-white"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={() => startTask(t._id)}
                  className="bg-green-600 px-3 py-1 text-white"
                >
                  Start
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <h2 className="text-lg mb-2">History</h2>

        <input
  type="date"
  value={selectedDate}
  max={new Date().toISOString().slice(0, 10)}
  onChange={async (e) => {
    const date = e.target.value;

    if (!date) return;

    setSelectedDate(date);
    setErrorMsg("");

    const res = await fetch(`/api/tasks/history?date=${date}`);
    const data = await res.json();

    if (!res.ok) {
      setHistory([]);
      setErrorMsg("Please select a valid previous date");
      return;
    }

    if (!Array.isArray(data)) {
      setHistory([]);
      setErrorMsg("Please select a valid previous date");
      return;
    }

    setHistory(data);
  }}
  className="border px-2 py-1"
/>
  {errorMsg && (
    <div className="text-red-500 mt-2">{errorMsg}</div>
  )}

        <ul className="mt-4 space-y-2">
          {history.length === 0 && selectedDate && (
            <li>No tasks found</li>
          )}

          {history.map((t) => (
            <li key={t._id} className="border p-2">
              {t.title} - {formatTime(t.totalTimeSeconds)}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => signOut()} className="mt-6 text-red-500">
        Logout
      </button>
    </main>
  );
}