/**
 * ScoreRing — Circular score badge (SVG).
 * Extracted from recommended-styles.tsx for DRY (VPL-006).
 * Uses Tier 3 tokens: --score-ring-track, --score-ring-track-stroke, --score-ring-text.
 */

interface ScoreRingProps {
  score: number;
  color: string;
  size?: number;
}

export function ScoreRing({ score, color, size = 36 }: ScoreRingProps) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div
      className="score-ring"
      style={{ ["--score-ring-size" as any]: `${size}px` }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="score-ring__svg"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="var(--score-ring-track)"
          stroke="var(--score-ring-track-stroke)"
          strokeWidth={2}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="score-ring__progress"
        />
        {/* Number */}
        <text
          x={size / 2}
          y={size / 2 + 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--score-ring-text)"
          fontSize={size * 0.33}
          fontWeight="700"
          fontFamily="var(--font-sans)"
          className="score-ring__text"
        >
          {score}
        </text>
      </svg>
    </div>
  );
}
