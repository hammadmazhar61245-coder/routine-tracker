"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type Task } from "@/lib/db";
import { todayISO } from "@/lib/utils";
import { cancelServerReminder } from "@/lib/push/client";

export function useAllTasks() {
  return useLiveQuery(() => db.tasks.orderBy("createdAt").toArray(), []) ?? [];
}

export function useTasksByDate(dateISO: string) {
  return (
    useLiveQuery(
      () =>
        db.tasks
          .where("date")
          .equals(dateISO)
          .toArray()
          .then((tasks) => tasks.sort((a, b) => a.time.localeCompare(b.time))),
      [dateISO]
    ) ?? []
  );
}

export function useTodayTasks() {
  return useTasksByDate(todayISO());
}

export function useTasks() {
  async function addTask(task: Omit<Task, "id" | "completed" | "notified" | "createdAt">) {
    return db.tasks.add({
      ...task,
      completed: false,
      notified: false,
      createdAt: Date.now(),
    });
  }

  async function updateTask(id: number, patch: Partial<Task>) {
    return db.tasks.update(id, patch);
  }

  async function deleteTask(id: number) {
    cancelServerReminder(id);
    return db.tasks.delete(id);
  }

  async function toggleComplete(id: number, completed: boolean) {
    if (completed) cancelServerReminder(id);
    return db.tasks.update(id, {
      completed,
      completedAt: completed ? Date.now() : undefined,
    });
  }

  async function markNotified(id: number) {
    return db.tasks.update(id, { notified: true });
  }

  async function clearAll() {
    return db.tasks.clear();
  }

  async function exportAll() {
    const tasks = await db.tasks.toArray();
    return JSON.stringify(tasks, null, 2);
  }

  return { addTask, updateTask, deleteTask, toggleComplete, markNotified, clearAll, exportAll };
}
