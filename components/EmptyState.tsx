"use client";

import { motion } from "motion/react";

export function EmptyState({
  title = "Nothing scheduled",
  subtitle = "Tap the + button to add your first task.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <motion.svg
        width="160"
        height="140"
        viewBox="0 0 160 140"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {[...Array(4)].map((_, i) => (
          <motion.circle
            key={i}
            r={2.5}
            fill="hsl(258 60% 70%)"
            animate={{
              cx: [80 + 46 * Math.cos((i * Math.PI) / 2), 80 + 46 * Math.cos((i * Math.PI) / 2 + Math.PI * 2)],
              cy: [30 + 30 * Math.sin((i * Math.PI) / 2), 30 + 30 * Math.sin((i * Math.PI) / 2 + Math.PI * 2)],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
          />
        ))}
        <rect x="38" y="28" width="84" height="100" rx="14" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
        <rect x="62" y="18" width="36" height="16" rx="6" fill="hsl(258 60% 58%)" />
        <line x1="52" y1="56" x2="108" y2="56" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
        <line x1="52" y1="72" x2="96" y2="72" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
        <line x1="52" y1="88" x2="102" y2="88" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
        <circle cx="45" cy="56" r="3.5" fill="hsl(258 60% 70%)" />
        <circle cx="45" cy="72" r="3.5" fill="hsl(var(--border))" />
        <circle cx="45" cy="88" r="3.5" fill="hsl(var(--border))" />
      </motion.svg>
      <p className="font-medium mt-2">{title}</p>
      <p className="text-sm text-fg-muted mt-1 max-w-[220px]">{subtitle}</p>
    </div>
  );
}
