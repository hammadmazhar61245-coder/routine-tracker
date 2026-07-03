import Dexie, { type Table } from "dexie";

export type Category = "work" | "study" | "fitness" | "personal" | "other";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id?: number;
  title: string;
  description?: string;
  date: string; // "2026-07-03"
  time: string; // "09:00"
  category: Category;
  priority: Priority;
  completed: boolean;
  completedAt?: number;
  imageBase64?: string;
  imageType?: string;
  notified: boolean;
  createdAt: number;
}

export interface Settings {
  id?: number;
  theme: "light" | "dark";
  notificationsEnabled: boolean;
  defaultReminderMinutes: number;
}

class PlanFlowDB extends Dexie {
  tasks!: Table<Task, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super("planflow-db");
    this.version(1).stores({
      tasks: "++id, date, time, category, priority, completed, createdAt",
      settings: "++id",
    });
  }
}

export const db = new PlanFlowDB();

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.toCollection().first();
  if (existing) return existing;
  const defaults: Settings = {
    theme: "light",
    notificationsEnabled: false,
    defaultReminderMinutes: 0,
  };
  const id = await db.settings.add(defaults);
  return { ...defaults, id };
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const updated = { ...current, ...patch };
  await db.settings.put(updated);
  return updated;
}
