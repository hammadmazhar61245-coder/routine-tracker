"use client";

import { motion } from "motion/react";
import { CalendarCheck, CalendarDays, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type View = "today" | "calendar" | "stats";

const TABS: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "today", label: "Today", icon: CalendarCheck },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "stats", label: "Stats", icon: BarChart3 },
];

export function BottomNav({ active, onChange }: { active: View; onChange: (v: View) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 glass-nav pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md flex items-center justify-around px-4 py-2">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl"
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl bg-accent-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 relative z-10",
                  isActive ? "text-accent" : "text-fg-muted"
                )}
              />
              <span
                className={cn(
                  "text-[11px] font-medium relative z-10",
                  isActive ? "text-accent" : "text-fg-muted"
                )}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
