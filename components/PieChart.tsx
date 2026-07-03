"use client";

import { motion } from "motion/react";
import { CATEGORY_LABELS } from "@/lib/utils";

const COLORS: Record<string, string> = {
  work: "hsl(243 75% 62%)",
  study: "hsl(200 85% 52%)",
  fitness: "hsl(160 60% 40%)",
  personal: "hsl(320 65% 58%)",
  other: "hsl(222 10% 52%)",
};

export function PieChart({
  data,
}: {
  data: { category: string; count: number }[];
}) {
  const size = 200;
  const radius = 70;
  const stroke = 26;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  // Compute each segment's dash/offset up front (no mutation during render).
  const { segments } = data.reduce<{
    segments: { category: string; dash: number; offset: number }[];
    cumulative: number;
  }>(
    (acc, d) => {
      const fraction = d.count / total;
      const dash = fraction * circumference;
      const offset = -acc.cumulative * circumference;
      acc.segments.push({ category: d.category, dash, offset });
      acc.cumulative += fraction;
      return acc;
    },
    { segments: [], cumulative: 0 }
  );

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="-rotate-90 shrink-0">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} opacity={0.3} />
        {data.map((d, i) => {
          const seg = segments[i];
          return (
            <motion.circle
              key={d.category}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={COLORS[d.category]}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              initial={{ strokeDashoffset: circumference, opacity: 0 }}
              animate={{ strokeDashoffset: seg.offset, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: "easeOut" }}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.category} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[d.category] }}
            />
            <span className="text-fg-muted">{CATEGORY_LABELS[d.category]}</span>
            <span className="font-medium tabular-nums">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 