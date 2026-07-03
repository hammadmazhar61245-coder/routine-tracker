"use client";

import { motion } from "motion/react";

export function AnimatedCheckbox({
  checked,
  onToggle,
  size = 26,
}: {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      animate={checked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      aria-label={checked ? "Mark task incomplete" : "Mark task complete"}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 26 26">
        <motion.circle
          cx="13"
          cy="13"
          r="11"
          fill={checked ? "hsl(var(--success))" : "transparent"}
          stroke={checked ? "hsl(var(--success))" : "hsl(var(--fg-muted))"}
          strokeWidth="2"
          animate={{
            fill: checked ? "hsl(152 45% 42%)" : "rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.25 }}
        />
        <motion.path
          d="M7.5 13.5L11 17L18.5 9"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            pathLength: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </svg>
    </motion.button>
  );
}
