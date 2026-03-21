export function normalizeTask(task) {
  const today = new Date().toISOString().slice(0, 10);

  // If task belongs to previous day and is still active
  if (task.date !== today && task.isActive && task.startedAt) {
    const elapsed = Math.floor((Date.now() - task.startedAt) / 1000);

    task.totalTimeSeconds += elapsed;

    // finalize it strictly in previous day
    task.startedAt = null;
    task.isActive = false;
  }

  return task;
}