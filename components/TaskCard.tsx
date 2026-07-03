"use client";

import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { Briefcase, BookOpen, Dumbbell, User, MoreHorizontal, Trash2 } from "lucide-react";
import type { Task } from "@/lib/db";
import { formatTime, CATEGORY_LABELS } from "@/lib/utils";
import { AnimatedCheckbox } from "./AnimatedCheckbox";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  work: Briefcase,
  study: BookOpen,
  fitness: Dumbbell,
  personal: User,
  other: MoreHorizontal,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-danger",
};

export function TaskCard({
  task,
  onToggle,
  onDelete,
  onImagePreview,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onImagePreview: (src: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-90, -20], [1, 0]);
  const Icon = CATEGORY_ICONS[task.category] ?? MoreHorizontal;

  return (
    <div className="relative">
      <div className="absolute inset-y-0 right-0 flex items-center pr-5">
        <motion.span style={{ opacity: deleteOpacity }} className="text-danger">
          <Trash2 className="h-5 w-5" />
        </motion.span>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -90, right: 0 }}
        dragElastic={0.15}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70) setConfirmDelete(true);
          else x.set(0);
        }}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="glass card-shadow rounded-[var(--radius-card)] p-3.5 relative"
      >
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <AnimatedCheckbox checked={task.completed} onToggle={onToggle} />
          </div>

          <button
            className="flex-1 min-w-0 text-left"
            onClick={() => setExpanded((e) => !e)}
          >
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-fg-muted">
              <span>{formatTime(task.time)}</span>
              <Icon className="h-3.5 w-3.5" />
              <span
                className={`h-1.5 w-1.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}
                aria-label={`${task.priority} priority`}
              />
            </div>
            <p
              className={`font-medium truncate mt-0.5 ${
                task.completed ? "line-through text-fg-muted" : "text-fg"
              }`}
            >
              {task.title}
            </p>

            <AnimatePresence>
              {expanded && (task.description || task.imageBase64) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-2">
                    {task.description && (
                      <p className="text-sm text-fg-muted">{task.description}</p>
                    )}
                    {task.imageBase64 && (
                      <img
                        src={task.imageBase64}
                        alt={task.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          onImagePreview(task.imageBase64!);
                        }}
                        className="rounded-xl max-h-48 object-cover cursor-zoom-in"
                      />
                    )}
                    <p className="text-xs text-fg-muted">{CATEGORY_LABELS[task.category]}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {task.imageBase64 && !expanded && (
            <img
              src={task.imageBase64}
              alt=""
              className="h-[60px] w-[60px] rounded-xl object-cover shrink-0"
              style={{ objectFit: "cover" }}
            />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
            onClick={() => {
              setConfirmDelete(false);
              x.set(0);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass card-shadow rounded-[var(--radius-modal)] p-6 w-full max-w-xs text-center"
            >
              <p className="font-medium mb-1">Delete this task?</p>
              <p className="text-sm text-fg-muted mb-5">This can&apos;t be undone.</p>
              <div className="flex gap-2">
                <button
                  className="flex-1 h-11 rounded-xl border border-border font-medium"
                  onClick={() => {
                    setConfirmDelete(false);
                    x.set(0);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 h-11 rounded-xl bg-danger text-white font-medium"
                  onClick={onDelete}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
