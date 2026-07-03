"use client";

import { motion, AnimatePresence } from "motion/react";

const COLORS = ["hsl(258 60% 58%)", "hsl(340 65% 58%)", "hsl(38 92% 55%)", "hsl(152 45% 42%)", "hsl(200 70% 50%)"];

export function CelebrationOverlay({ show }: { show: boolean }) {
  const particles = Array.from({ length: 24 }, (_, i) => i);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center">
          {particles.map((i) => {
            const angle = (i / particles.length) * Math.PI * 2;
            const distance = 90 + Math.random() * 140;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            return (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 6 + Math.random() * 6,
                  height: 6 + Math.random() * 6,
                  background: COLORS[i % COLORS.length],
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ x, y, opacity: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 + Math.random() * 0.4, ease: "easeOut" }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
