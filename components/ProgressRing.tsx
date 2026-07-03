"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState } from "react";

export function ProgressRing({
  completed,
  total,
  size = 156,
  stroke = 12,
}: {
  completed: number;
  total: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? completed / total : 0;
  const glow = pct > 0.5;

  const progress = useMotionValue(0);
  const [displayPct, setDisplayPct] = useState(0);
  const dashOffset = useTransform(progress, (v) => circumference * (1 - v));

  useEffect(() => {
    const controls = animate(progress, pct, {
      type: "spring",
      stiffness: 100,
      damping: 20,
    });
    const unsub = progress.on("change", (v) => setDisplayPct(Math.round(v * 100)));
    return () => {
      controls.stop();
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(258 60% 58%)" />
            <stop offset="100%" stopColor="hsl(280 65% 66%)" />
          </linearGradient>
          {glow && (
            <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
          filter={glow ? "url(#ringGlow)" : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight tabular-nums">{displayPct}%</span>
        <span className="text-xs text-fg-muted mt-0.5">
          {completed} of {total} tasks
        </span>
      </div>
    </div>
  );
}
