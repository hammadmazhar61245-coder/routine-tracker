"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format, subDays, parseISO } from "date-fns";

export function useStats() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) ?? [];

  return useMemo(() => {
    const totalCreated = tasks.length;
    const totalCompleted = tasks.filter((t) => t.completed).length;

    // Last 7 days, oldest -> newest
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const iso = format(date, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.date === iso);
      const completed = dayTasks.filter((t) => t.completed).length;
      return {
        date: iso,
        label: format(date, "EEEEE"),
        total: dayTasks.length,
        completed,
        rate: dayTasks.length ? completed / dayTasks.length : 0,
      };
    });

    const weeklyCompletionRate = (() => {
      const totalWeek = last7.reduce((s, d) => s + d.total, 0);
      const doneWeek = last7.reduce((s, d) => s + d.completed, 0);
      return totalWeek ? Math.round((doneWeek / totalWeek) * 100) : 0;
    })();

    const bestDay = last7.reduce(
      (best, d) => (d.completed > best.completed ? d : best),
      last7[0]
    );

    // Streak: consecutive days ending today with >=1 completed task
    let streak = 0;
    for (let i = 0; ; i++) {
      const iso = format(subDays(new Date(), i), "yyyy-MM-dd");
      const hasCompleted = tasks.some((t) => t.date === iso && t.completed);
      if (hasCompleted) {
        streak++;
      } else {
        if (i === 0) continue; // today may just not have a completed task yet
        break;
      }
    }

    const categories = ["work", "study", "fitness", "personal", "other"] as const;
    const categoryBreakdown = categories
      .map((cat) => ({
        category: cat,
        count: tasks.filter((t) => t.category === cat).length,
      }))
      .filter((c) => c.count > 0);

    return {
      totalCreated,
      totalCompleted,
      weeklyCompletionRate,
      bestDay,
      last7,
      streak,
      categoryBreakdown,
    };
  }, [tasks]);
}
