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
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block" }}
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
          style={{
            transition:
              "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}
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
          fontFamily="'DM Sans', sans-serif"
          style={{ fontFeatureSettings: "'tnum'" }}
        >
          {score}
        </text>
      </svg>
    </div>
  );
}
