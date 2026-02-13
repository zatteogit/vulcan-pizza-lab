import React, { useId } from "react";
import { motion } from "motion/react";

interface ScoreRingProps {
  score: number;
  label: string;
  color: string;
  gradient?: string;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({
  score,
  label,
  color,
  gradient,
  size = 88,
  strokeWidth = 6,
}: ScoreRingProps) {
  const id = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const gradId = `ring-${id}`;

  const gradColors = gradient
    ? gradient.match(/#[0-9a-fA-F]{6}/g) || [color, color]
    : [color, color];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient
              id={gradId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={gradColors[0]} />
              <stop
                offset="100%"
                stopColor={gradColors[1] || gradColors[0]}
              />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-container)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono"
            style={{
              fontSize: size * 0.28,
              fontWeight: 700,
              color,
            }}
          >
            {score}
          </span>
        </div>
      </div>
      <span
        className="text-muted-foreground tracking-wide uppercase"
        style={{
          fontSize: "0.5625rem",
          fontWeight: 600,
          letterSpacing: "0.6px",
        }}
      >
        {label}
      </span>
    </div>
  );
}