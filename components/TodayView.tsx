"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, RefreshCw } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTodayTasks, useTasks } from "@/hooks/useTasks";
import { formatFullDate, greeting, todayISO } from "@/lib/utils";

export function TodayView({
  onAddTask,
  onImagePreview,
}: {
  onAddTask: () => void;
  onImagePreview: (src: string) => void;
}) {
  const tasks = useTodayTasks();
  const { toggleComplete, deleteTask } = useTasks();
  const [celebrate, setCelebrate] = useState(false);

  const upcoming = useMemo(
    () => tasks.filter((t) => !t.completed).sort((a, b) => a.time.localeCompare(b.time)),
    [tasks]
  );
  const completed = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  async function handleToggle(id: number, next: boolean) {
    await toggleComplete(id, next);
    if (next && upcoming.length === 1) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1000);
    }
  }

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-28">
      <CelebrationOverlay show={celebrate} />

      <header className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-fg-muted">{greeting()}</p>
          <h1 className="font-display text-2xl font-bold tracking-tight mt-0.5">
            {formatFullDate(todayISO())}
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="glass card-shadow rounded-[var(--radius-card)] p-5 flex items-center justify-between mb-6">
        <ProgressRing completed={completed.length} total={tasks.length} />
        <div className="text-right">
          <p className="text-xs text-fg-muted">Today</p>
          <p className="text-lg font-bold">{tasks.length} tasks</p>
          <p className="text-xs text-fg-muted mt-1">{completed.length} completed</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold tracking-tight text-fg-muted mb-3">
                Upcoming
              </h2>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {upcoming.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggle={() => handleToggle(t.id!, true)}
                      onDelete={() => deleteTask(t.id!)}
                      onImagePreview={onImagePreview}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-bold tracking-tight text-fg-muted mb-3">
                Completed
              </h2>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {completed.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggle={() => handleToggle(t.id!, false)}
                      onDelete={() => deleteTask(t.id!)}
                      onImagePreview={onImagePreview}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </>
      )}

      <motion.button
        onClick={onAddTask}
        className="fixed bottom-24 right-5 z-30 h-15 w-15 rounded-full bg-accent text-accent-fg shadow-lg flex items-center justify-center"
        style={{ width: 60, height: 60 }}
        whileTap={{ scale: 0.9, rotate: 45 }}
      >
        <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-30" />
        <Plus className="h-7 w-7 relative z-10" />
      </motion.button>
    </div>
  );
}
