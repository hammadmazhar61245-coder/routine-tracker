"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  addDays,
  startOfWeek,
  format,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
} from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { useTasksByDate, useTasks } from "@/hooks/useTasks";
import { cn, formatMonthYear, isDateToday } from "@/lib/utils";

export function CalendarView({
  onAddTask,
  onImagePreview,
}: {
  onAddTask: (dateISO: string) => void;
  onImagePreview: (src: string) => void;
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toggleComplete, deleteTask } = useTasks();

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const selectedISO = format(selectedDate, "yyyy-MM-dd");
  const tasks = useTasksByDate(selectedISO);

  const allDates = useLiveQuery(() => db.tasks.toArray().then((t) => t.map((x) => x.date)), []) ?? [];
  const datesWithTasks = new Set(allDates);

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [weekStart]);

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-28">
      <header className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {formatMonthYear(weekStart)}
        </h1>
        <div className="flex gap-1">
          <button
            onClick={() => setWeekStart((w) => subWeeks(w, 1))}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-card"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-card"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const selected = isSameDay(day, selectedDate);
          const today = isDateToday(iso);
          const hasTasks = datesWithTasks.has(iso);
          return (
            <button
              key={iso}
              onClick={() => setSelectedDate(day)}
              className="flex flex-col items-center gap-1.5 shrink-0 w-12"
            >
              <span className="text-[11px] font-medium text-fg-muted">
                {format(day, "EEEEE")}
              </span>
              <motion.span
                className={cn(
                  "relative h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold",
                  selected
                    ? "bg-accent text-accent-fg"
                    : today
                    ? "ring-2 ring-accent text-accent"
                    : "text-fg"
                )}
                animate={today && !selected ? { scale: [1, 1.06, 1] } : {}}
                transition={{ duration: 2, repeat: today ? Infinity : 0 }}
              >
                {format(day, "d")}
              </motion.span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  hasTasks ? "bg-warning" : "bg-transparent"
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6 mb-3">
        <h2 className="text-sm font-bold tracking-tight text-fg-muted">
          {format(selectedDate, "EEEE, MMMM d")}
        </h2>
        <button
          onClick={() => onAddTask(selectedISO)}
          className="flex items-center gap-1 text-xs font-medium text-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="No tasks this day" subtitle="Tap Add to schedule something." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onToggle={() => toggleComplete(t.id!, !t.completed)}
                onDelete={() => deleteTask(t.id!)}
                onImagePreview={onImagePreview}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
