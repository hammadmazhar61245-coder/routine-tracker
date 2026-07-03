"use client";

import { useCallback, useEffect, useState } from "react";
import { db, type Task } from "@/lib/db";
import {
  isNotificationSupported,
  requestNotificationPermission,
  scheduleTaskNotification,
  clearTaskNotification,
  clearAllScheduled,
} from "@/lib/notifications";
import { todayISO } from "@/lib/utils";

export interface ToastState {
  id: number;
  title: string;
  time: string;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    setSupported(isNotificationSupported());
    if (isNotificationSupported()) setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  const handleFired = useCallback(async (taskId: number) => {
    await db.tasks.update(taskId, { notified: true });
  }, []);

  const handleForegroundToast = useCallback((task: Task) => {
    setToast({ id: task.id!, title: task.title, time: task.time });
    setTimeout(() => setToast((t) => (t?.id === task.id ? null : t)), 5000);
  }, []);

  // Reschedule all of today's pending tasks whenever the app opens/regains focus.
  const rescheduleAll = useCallback(async () => {
    const today = todayISO();
    const tasks = await db.tasks
      .where("date")
      .equals(today)
      .toArray();
    clearAllScheduled();
    for (const task of tasks) {
      if (!task.completed && !task.notified) {
        scheduleTaskNotification(task, handleForegroundToast, handleFired);
      }
    }
  }, [handleFired, handleForegroundToast]);

  useEffect(() => {
    rescheduleAll();
    const onVisibility = () => {
      if (document.visibilityState === "visible") rescheduleAll();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", rescheduleAll);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", rescheduleAll);
    };
  }, [rescheduleAll]);

  const scheduleOne = useCallback(
    (task: Task) => scheduleTaskNotification(task, handleForegroundToast, handleFired),
    [handleFired, handleForegroundToast]
  );

  const cancelOne = useCallback((taskId: number) => clearTaskNotification(taskId), []);

  return {
    supported,
    permission,
    requestPermission,
    toast,
    dismissToast: () => setToast(null),
    scheduleOne,
    cancelOne,
    rescheduleAll,
  };
}
