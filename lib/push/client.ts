import type { Task } from "@/lib/db";
import { combineDateTime } from "@/lib/utils";

export async function scheduleServerReminder(task: Task) {
  if (!task.id || task.completed) return;
  const dueAt = combineDateTime(task.date, task.time).getTime();
  if (dueAt <= Date.now()) return;
  try {
    await fetch("/api/push/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, title: task.title, date: task.date, time: task.time, dueAt }),
    });
  } catch {
    // Non-fatal — local setTimeout fallback still covers the foreground case.
  }
}

export async function cancelServerReminder(taskId: number) {
  try {
    await fetch(`/api/push/schedule?taskId=${taskId}`, { method: "DELETE" });
  } catch {
    // Non-fatal.
  }
}
