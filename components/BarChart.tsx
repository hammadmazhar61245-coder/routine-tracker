"use client";

import { motion } from "motion/react";

export function BarChart({
  data,
}: {
  data: { label: string; rate: number; total: number }[];
}) {
  const width = 320;
  const height = 140;
  const barWidth = 28;
  const gap = (width - barWidth * data.length) / (data.length + 1);
  const maxBarHeight = 100;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
       <linearGradient id="barGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="hsl(243 75% 62%)" />
          <stop offset="100%" stopColor="hsl(200 85% 60%)" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const x = gap + i * (barWidth + gap);
        const h = Math.max(4, d.rate * maxBarHeight);
        const y = maxBarHeight - h;
        return (
          <g key={d.label + i}>
            <rect
              x={x}
              y={0}
              width={barWidth}
              height={maxBarHeight}
              rx={8}
              fill="hsl(var(--border))"
              opacity={0.4}
            />
            <motion.rect
              x={x}
              width={barWidth}
              rx={8}
              fill="url(#barGradient)"
              initial={{ height: 0, y: maxBarHeight }}
              animate={{ height: h, y }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 120, damping: 16 }}
            />
            <text
              x={x + barWidth / 2}
              y={maxBarHeight + 22}
              textAnchor="middle"
              className="fill-fg-muted text-[11px] font-medium"
            >
              {d.label}
            </text>
            {d.total > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-fg text-[10px] font-semibold tabular-nums"
              >
                {Math.round(d.rate * 100)}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
