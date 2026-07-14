/**
 * ScoreRing — Circular score badge (SVG).
 * Extracted from recommended-styles.tsx for DRY (VPL-006).
 * Uses Tier 3 tokens: --score-ring-track, --score-ring-track-stroke, --score-ring-text.
 *
 * Compromesso scoring (nota Matteo, pin VPL-059548): quando è noto il punteggio
 * di PARTENZA (compatibilità out-of-the-box) oltre a quello OTTIMIZZATO, l'anello
 * lo racconta senza perdere l'estetica — segmento pieno = partenza, estensione
 * soft-glow = il salto guadagnato ottimizzando; il numero al centro resta
 * l'ottimizzato. Senza `baseScore` il comportamento è identico a prima (usato
 * anche dai 5 assi del composite, dove il concetto partenza→ottimizzata non vale).
 */
interface ScoreRingProps {
  score: number;
  color: string;
  size?: number;
  /** Punteggio di partenza (pre-ottimizzazione). Se < score, l'anello mostra
   *  il salto partenza→ottimizzata come estensione soft dello stesso colore. */
  baseScore?: number;
}

export function ScoreRing({ score, color, size = 36, baseScore }: ScoreRingProps) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const rounded = Math.round(score);
  const roundedBase = typeof baseScore === "number" ? Math.round(baseScore) : rounded;
  const hasGain = roundedBase < rounded;

  const offset = circ * (1 - rounded / 100);
  const baseOffset = circ * (1 - roundedBase / 100);

  return (
    <div
      className="score-ring"
      style={{
        ["--score-ring-size" as any]: `${size}px`,
        ["--score-ring-label-size" as any]: `${size * 0.33}px`,
      }}
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
        {/* Gain arc (partenza→ottimizzata): alone soft dello stesso colore fino
            all'ottimizzato, disegnato sotto così il segmento di partenza lo
            copre pieno e resta visibile solo il "salto". */}
        {hasGain && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeOpacity={0.4}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="score-ring__progress score-ring__progress--gain"
          />
        )}
        {/* Progress ring — pieno fino alla partenza (o all'unico punteggio). */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={hasGain ? baseOffset : offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="score-ring__progress"
        />
        {/* Number — sempre l'ottimizzato (ciò che otterrai aprendo lo stile). */}
        <text
          x={size / 2}
          y={size / 2 + 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--score-ring-text)"
          className="score-ring__text"
        >
          {rounded}
        </text>
      </svg>
    </div>
  );
}
