import { motion, AnimatePresence } from "motion/react";
import { Lightbulb } from "lucide-react";

export type FormSection =
  | "weather"
  | "when"
  | "skill"
  | "dietary"
  | "equipment"
  | "oven"
  | "pantry";

interface ProgressPillProps {
  activeSection: FormSection;
  visible: boolean;
}

const SECTION_ORDER: FormSection[] = [
  "weather",
  "when",
  "skill",
  "dietary",
  "equipment",
  "oven",
  "pantry",
];

const SECTION_LABELS: Record<FormSection, string> = {
  weather: "Meteo",
  when: "Quando",
  skill: "Livello",
  dietary: "Dieta",
  equipment: "Strumenti",
  oven: "Forno",
  pantry: "Dispensa",
};

/* ═══ Contextual tips — appear on desktop near the stepper ═══ */
const SECTION_TIPS: Record<FormSection, string> = {
  weather:
    "La temperatura della cucina influenza direttamente i tempi di lievitazione.",
  when: "Più tempo hai, più opzioni per impasti a lunga maturazione — leggeri e digeribili.",
  skill:
    "Adattiamo la complessità della ricetta alla tua esperienza.",
  dietary:
    "Filtriamo farine e ingredienti incompatibili con le tue esigenze.",
  equipment:
    "Pietra o piastra cambiano la crosta. Senza, otterrai comunque ottimi risultati.",
  oven: "La temperatura massima determina quali stili puoi replicare a casa.",
  pantry: "Adatteremo la ricetta alla tua dispensa reale.",
};

function scrollToSection(sectionId: FormSection) {
  const el = document.querySelector<HTMLElement>(
    `[data-section="${sectionId}"]`,
  );
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Fixed progress pill — minimal vertical indicator on the left edge.
 * Desktop only (hidden on mobile). Includes contextual tip for active section.
 * Dots are clickable → scroll to the corresponding section.
 */
export function ProgressPill({
  activeSection,
  visible,
}: ProgressPillProps) {
  const currentIdx = SECTION_ORDER.indexOf(activeSection);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: visible ? 1 : 0,
        x: visible ? 0 : -20,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 28,
      }}
      className="fixed z-40 hidden lg:flex flex-col items-start gap-2.5"
      style={{
        left: "clamp(12px, 2vw, 24px)",
        top: "50%",
        transform: "translateY(-50%)",
        maxWidth: 200,
      }}
    >
      {/* Vertical dots with active label */}
      <div
        className="flex flex-col items-center gap-1.5 px-2.5 py-3 rounded-2xl self-center"
        style={{
          background:
            "color-mix(in srgb, var(--surface-container) 85%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--outline-variant)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {SECTION_ORDER.map((s, i) => {
          const isActive = s === activeSection;
          const isPast = i < currentIdx;
          return (
            <button
              key={s}
              onClick={() => scrollToSection(s)}
              className="flex items-center gap-0 cursor-pointer"
              style={{
                background: "none",
                border: "none",
                padding: "3px 2px",
              }}
              aria-label={SECTION_LABELS[s]}
            >
              <motion.div
                animate={{
                  width: isActive ? 20 : 5,
                  height: 5,
                  backgroundColor: isActive
                    ? "var(--primary)"
                    : isPast
                      ? "var(--outline)"
                      : "var(--outline-variant)",
                  borderRadius: 3,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Active section label */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        className="px-2 py-0.5 rounded-lg self-center"
        style={{
          background:
            "color-mix(in srgb, var(--primary) 10%, transparent)",
          fontSize: "0.5625rem",
          fontWeight: 600,
          color: "var(--primary)",
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
        }}
      >
        {SECTION_LABELS[activeSection]}
      </motion.div>

      {/* ── Contextual tip — floats below the stepper (desktop only) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 28,
            delay: 0.08,
          }}
          className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background:
              "color-mix(in srgb, var(--surface-container) 90%, transparent)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border:
              "1px solid color-mix(in srgb, var(--tertiary) 12%, var(--outline-variant))",
            maxWidth: 180,
          }}
        >
          <Lightbulb
            size={11}
            style={{
              color: "var(--tertiary)",
              flexShrink: 0,
              marginTop: 2,
            }}
          />
          <span
            style={{
              fontSize: "0.6875rem",
              lineHeight: 1.5,
              color: "var(--muted-foreground)",
              fontStyle: "italic",
            }}
          >
            {SECTION_TIPS[activeSection]}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Mobile progress bar — segmented, tappable.
 * Tapping a segment scrolls to the corresponding section.
 */
export function MobileProgressBar({
  activeSection,
}: {
  activeSection: FormSection;
}) {
  const currentIdx = SECTION_ORDER.indexOf(activeSection);

  return (
    <div className="lg:hidden w-full flex items-center gap-1">
      {SECTION_ORDER.map((s, i) => {
        const isActive = s === activeSection;
        const isPast = i <= currentIdx;
        return (
          <button
            key={s}
            onClick={() => scrollToSection(s)}
            className="relative flex-1 h-6 flex items-center cursor-pointer"
            style={{
              background: "none",
              border: "none",
              padding: 0,
            }}
            aria-label={SECTION_LABELS[s]}
          >
            <div
              className="w-full h-1 rounded-full overflow-hidden"
              style={{
                background: "var(--outline-variant)",
              }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{
                  width: isPast ? "100%" : "0%",
                  backgroundColor: isActive
                    ? "var(--primary)"
                    : "var(--outline)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            </div>
            {/* Label on active */}
            {isActive && (
              <motion.span
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-0.5 left-1/2 -translate-x-1/2 whitespace-nowrap"
                style={{
                  fontSize: "0.5625rem",
                  fontWeight: 600,
                  color: "var(--primary)",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase" as const,
                }}
              >
                {SECTION_LABELS[s]}
              </motion.span>
            )}
          </button>
        );
      })}
    </div>
  );
}