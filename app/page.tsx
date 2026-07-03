"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BottomNav, type View } from "@/components/BottomNav";
import { TodayView } from "@/components/TodayView";
import { CalendarView } from "@/components/CalendarView";
import { StatsView } from "@/components/StatsView";
import { AddTaskModal } from "@/components/AddTaskModal";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { ReminderToast } from "@/components/ReminderToast";
import { useNotifications } from "@/hooks/useNotifications";
import { todayISO } from "@/lib/utils";

export default function Home() {
  const [view, setView] = useState<View>("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(todayISO());
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const { toast, dismissToast } = useNotifications();

  return (
    <div className="min-h-dvh max-w-md mx-auto relative">
      <ReminderToast toast={toast} onDismiss={dismissToast} />

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {view === "today" && (
            <TodayView
              onAddTask={() => {
                setModalDate(todayISO());
                setModalOpen(true);
              }}
              onImagePreview={setPreviewSrc}
            />
          )}
          {view === "calendar" && (
            <CalendarView
              onAddTask={(date) => {
                setModalDate(date);
                setModalOpen(true);
              }}
              onImagePreview={setPreviewSrc}
            />
          )}
          {view === "stats" && <StatsView />}
        </motion.div>
      </AnimatePresence>

      <BottomNav active={view} onChange={setView} />
      <AddTaskModal open={modalOpen} onOpenChange={setModalOpen} defaultDate={modalDate} />
      <ImagePreviewModal src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </div>
  );
}
