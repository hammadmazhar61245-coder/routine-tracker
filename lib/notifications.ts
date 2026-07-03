import { msUntil } from "./utils";
import type { Task } from "./db";

// Max delay setTimeout can reliably hold (browsers clamp ~24.8 days at 2^31-1 ms).
const MAX_TIMEOUT = 2_147_000_000;

const scheduled = new Map<number, ReturnType<typeof setTimeout>>();

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

async function fireNotification(task: Task, onForegroundToast: (task: Task) => void) {
  const isForeground = document.visibilityState === "visible";
  if (isForeground) {
    onForegroundToast(task);
  }
  if (isNotificationSupported() && Notification.permission === "granted") {
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      const body = `${task.title} · scheduled for now`;
      if (reg) {
        await reg.showNotification("PlanFlow", {
          body,
          tag: `task-${task.id}`,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          vibrate: [200, 100, 200],
          data: { taskId: task.id },
        } as NotificationOptions);
      } else {
        new Notification("PlanFlow", { body, tag: `task-${task.id}` });
      }
    } catch {
      // Notifications can silently fail on iOS if the app isn't foregrounded; ignore.
    }
  }
}

/** Schedule a single task's reminder. Skips if the time has already passed. */
export function scheduleTaskNotification(
  task: Task,
  onForegroundToast: (task: Task) => void,
  onFired: (taskId: number) => void
) {
  if (!task.id || task.completed || task.notified) return;
  const delay = msUntil(task.date, task.time);
  if (delay <= 0 || delay > MAX_TIMEOUT) return;

  clearTaskNotification(task.id);
  const handle = setTimeout(async () => {
    await fireNotification(task, onForegroundToast);
    onFired(task.id!);
    scheduled.delete(task.id!);
  }, delay);
  scheduled.set(task.id, handle);
}

export function clearTaskNotification(taskId: number) {
  const handle = scheduled.get(taskId);
  if (handle) {
    clearTimeout(handle);
    scheduled.delete(taskId);
  }
}

export function clearAllScheduled() {
  scheduled.forEach((h) => clearTimeout(h));
  scheduled.clear();
}
