"use client";

import { motion, AnimatePresence } from "motion/react";
import { Bell } from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { ToastState } from "@/hooks/useNotifications";

export function ReminderToast({
  toast,
  onDismiss,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -40, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -40, x: "-50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="fixed top-[calc(env(safe-area-inset-top)+12px)] left-1/2 z-[90] w-[92%] max-w-sm"
          onClick={onDismiss}
        >
          <div className="glass card-shadow rounded-2xl p-3.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
              <Bell className="h-4 w-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{toast.title}</p>
              <p className="text-xs text-fg-muted font-mono tabular-nums">{formatTime(toast.time)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
