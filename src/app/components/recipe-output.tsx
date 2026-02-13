import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Clock,
  ChefHat,
  Flame,
  Scissors,
  Timer,
  Hand,
  Expand,
  Beaker,
  Lightbulb,
  Copy,
  Check,
  Minus,
  Plus,
  Share2,
  Droplets,
  FlaskConical,
} from "lucide-react";
import {
  GeneratedRecipe,
  UserConstraints,
} from "./pizza-engine";

interface RecipeOutputProps {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
}

/* ═══ CLOCK HELPERS ═══ */
function roundToQuarter(date: Date): Date {
  const d = new Date(date);
  const mins = d.getMinutes();
  const rounded = Math.ceil(mins / 15) * 15;
  d.setMinutes(rounded, 0, 0);
  if (rounded >= 60) {
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
  }
  return d;
}
function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60 * 1000);
}
function fmtTime(date: Date): string {
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
function shiftQuarter(date: Date, direction: number): Date {
  return new Date(date.getTime() + direction * 15 * 60 * 1000);
}

/* ═══ Clipboard helpers ═══ */
function copyToClipboard(text: string, onSuccess: () => void) {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    navigator.clipboard
      .writeText(text)
      .then(onSuccess)
      .catch(() => fallbackCopy(text, onSuccess));
  } else {
    fallbackCopy(text, onSuccess);
  }
}
function fallbackCopy(text: string, onSuccess: () => void) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    onSuccess();
  } catch {
    /* silently fail */
  }
}

export function RecipeOutput({
  recipe,
  constraints,
  onConstraintsChange,
}: RecipeOutputProps) {
  const [copiedIng, setCopiedIng] = useState(false);
  const [copiedProc, setCopiedProc] = useState(false);
  const [startTime, setStartTime] = useState(() =>
    roundToQuarter(new Date()),
  );
  const [editingTime, setEditingTime] = useState(false);

  const isNerd = constraints.skill_level >= 3;

  const handleCopyIngredients = () => {
    const text = formatIngredientsText(recipe);
    copyToClipboard(text, () => {
      setCopiedIng(true);
      setTimeout(() => setCopiedIng(false), 2000);
    });
  };
  const handleShareProcedure = () => {
    const text = formatProcedureText(
      recipe,
      stepTimes,
      startTime,
    );
    if (navigator.share) {
      navigator
        .share({ title: `${recipe.style.name} — Vulcan`, text })
        .catch(() => {
          copyToClipboard(text, () => {
            setCopiedProc(true);
            setTimeout(() => setCopiedProc(false), 2000);
          });
        });
    } else {
      copyToClipboard(text, () => {
        setCopiedProc(true);
        setTimeout(() => setCopiedProc(false), 2000);
      });
    }
  };

  const stepTimes = React.useMemo(() => {
    let cursor = new Date(startTime);
    return recipe.timeline.map((step) => {
      const start = new Date(cursor);
      const end = addMinutes(cursor, step.duration_minutes);
      cursor = end;
      return { start, end };
    });
  }, [recipe.timeline, startTime]);

  const endTime =
    stepTimes.length > 0
      ? stepTimes[stepTimes.length - 1].end
      : startTime;

  const handleTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const d = new Date(startTime);
      d.setHours(h, m, 0, 0);
      setStartTime(d);
    }
    setEditingTime(false);
  };

  const updateBalls = (n: number) => {
    onConstraintsChange({
      ...constraints,
      dough_balls: Math.max(1, Math.min(20, n)),
    });
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-14">
      {/* ── Ingredients + panetti stepper ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3>Ingredienti</h3>
          <motion.button
            onClick={handleCopyIngredients}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            {copiedIng ? (
              <Check
                size={14}
                style={{ color: "var(--cta)" }}
              />
            ) : (
              <Copy size={14} />
            )}
            {copiedIng ? "Copiato!" : "Copia"}
          </motion.button>
        </div>

        <div
          className="flex items-center gap-4 mb-4 pb-4"
          style={{
            borderBottom: "1px solid var(--border-muted)",
          }}
        >
          <span
            className="text-muted-foreground"
            style={{ fontSize: "0.8125rem", fontWeight: 500 }}
          >
            Panetti
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() =>
                updateBalls(constraints.dough_balls - 1)
              }
              disabled={constraints.dough_balls <= 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-20"
              style={{
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <Minus size={12} />
            </motion.button>
            <motion.span
              key={constraints.dough_balls}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                minWidth: 28,
                textAlign: "center",
                fontFamily: "'DM Sans', sans-serif",
                fontVariantNumeric: "tabular-nums",
                color: "var(--primary)",
              }}
            >
              {constraints.dough_balls}
            </motion.span>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() =>
                updateBalls(constraints.dough_balls + 1)
              }
              disabled={constraints.dough_balls >= 20}
              className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-20"
              style={{
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <Plus size={12} />
            </motion.button>
          </div>
          <span
            className="text-muted-foreground"
            style={{ fontSize: "0.8125rem" }}
          >
            da {recipe.ball_weight_g}g
          </span>
        </div>

        <div className="flex flex-col">
          <IngRow
            name="Farina"
            detail={`W${recipe.flour_w}`}
            amount={recipe.flour_g}
          />
          <IngRow
            name="Acqua"
            detail={`${recipe.hydration_pct}%`}
            amount={recipe.water_g}
          />
          <IngRow name="Sale" amount={recipe.salt_g} />
          <IngRow
            name={
              recipe.yeast_type === "fresh"
                ? "Lievito fresco"
                : recipe.yeast_type === "dry"
                  ? "Lievito secco"
                  : "Lievito madre"
            }
            amount={recipe.yeast_g}
          />
          {recipe.oil_g > 0 && (
            <IngRow name="Olio EVO" amount={recipe.oil_g} />
          )}
          {recipe.sugar_g > 0 && (
            <IngRow name="Zucchero" amount={recipe.sugar_g} />
          )}
        </div>
        <div
          className="mt-3 text-muted-foreground"
          style={{
            fontSize: "0.8125rem",
            fontFamily: "'DM Sans', sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {recipe.dough_balls} × {recipe.ball_weight_g}g ={" "}
          {recipe.total_dough_g}g totale
        </div>
      </div>

      {/* ── Procedure / Timeline with inline tips ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <h3>Procedimento</h3>
            <span
              className="text-muted-foreground"
              style={{
                fontSize: "0.75rem",
                fontFamily: "'DM Sans', sans-serif",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {recipe.timeline.length} passaggi
            </span>
          </div>
          <motion.button
            onClick={handleShareProcedure}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            {copiedProc ? (
              <Check
                size={14}
                style={{ color: "var(--cta)" }}
              />
            ) : (
              <Share2 size={14} />
            )}
            {copiedProc ? "Copiato!" : "Condividi"}
          </motion.button>
        </div>

        {/* Start / end time */}
        <div
          className="flex items-center gap-4 mb-6 py-3 px-4 rounded-xl"
          style={{
            background: "var(--surface-container-low)",
            border: "1px solid var(--outline-variant)",
          }}
        >
          <div className="flex-1 flex items-center gap-3">
            <span
              className="text-muted-foreground"
              style={{ fontSize: "0.8125rem", fontWeight: 500 }}
            >
              Inizio
            </span>
            <div className="flex items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setStartTime((s) => shiftQuarter(s, -1))
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                }}
              >
                <Minus size={12} />
              </motion.button>
              {editingTime ? (
                <input
                  type="time"
                  autoFocus
                  defaultValue={fmtTime(startTime)}
                  onBlur={handleTimeInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      (e.target as HTMLInputElement).blur();
                  }}
                  className="bg-transparent text-foreground text-center outline-none"
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    width: 72,
                    fontFamily: "'DM Sans', sans-serif",
                    fontVariantNumeric: "tabular-nums",
                    border: "none",
                    borderBottom: "2px solid var(--primary)",
                  }}
                />
              ) : (
                <button
                  onClick={() => setEditingTime(true)}
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    minWidth: 52,
                    textAlign: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    fontVariantNumeric: "tabular-nums",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--foreground)",
                    borderBottom:
                      "1px dashed var(--outline-variant)",
                    paddingBottom: 1,
                  }}
                >
                  {fmtTime(startTime)}
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setStartTime((s) => shiftQuarter(s, 1))
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                }}
              >
                <Plus size={12} />
              </motion.button>
            </div>
          </div>
          <div
            className="h-6 w-px"
            style={{ background: "var(--outline-variant)" }}
          />
          <div className="flex items-center gap-3">
            <span
              className="text-muted-foreground"
              style={{ fontSize: "0.8125rem", fontWeight: 500 }}
            >
              Fine
            </span>
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                fontVariantNumeric: "tabular-nums",
                color: "var(--cta)",
              }}
            >
              {fmtTime(endTime)}
            </span>
          </div>
        </div>

        {/* Steps with inline tips */}
        <div className="relative">
          <div
            className="absolute left-[16px] top-4 bottom-4 w-px"
            style={{ background: "var(--outline-variant)" }}
          />
          <div className="flex flex-col gap-0">
            {recipe.timeline.map((step, i) => {
              const StepIcon = getIcon(step.icon);
              const isFirst = i === 0;
              const isLast = i === recipe.timeline.length - 1;
              const times = stepTimes[i];
              const tipText = step.tip
                ? isNerd
                  ? step.tip.nerd
                  : step.tip.beginner
                : null;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.3,
                  }}
                  className="flex gap-4 pb-6 last:pb-0"
                >
                  {/* Node */}
                  <div
                    className="relative z-10 w-[33px] h-[33px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isFirst
                        ? "var(--primary)"
                        : isLast
                          ? "var(--cta)"
                          : "var(--surface-container)",
                      color:
                        isFirst || isLast
                          ? "white"
                          : "var(--tertiary)",
                      border:
                        isFirst || isLast
                          ? "none"
                          : "2px solid var(--outline-variant)",
                    }}
                  >
                    <StepIcon size={14} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-foreground"
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                        }}
                      >
                        {step.title}
                      </span>
                      <span
                        className="flex-shrink-0 px-2.5 py-0.5 rounded-lg"
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          fontVariantNumeric: "tabular-nums",
                          background:
                            isFirst || isLast
                              ? "var(--primary-container)"
                              : "var(--surface-container)",
                          color:
                            isFirst || isLast
                              ? "var(--on-primary-container)"
                              : "var(--muted-foreground)",
                        }}
                      >
                        {times
                          ? fmtTime(times.start)
                          : step.timing_label}
                      </span>
                    </div>
                    <p
                      className="text-muted-foreground mt-1"
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {step.description}
                    </p>
                    {step.duration_minutes > 0 && (
                      <span
                        className="inline-block mt-1.5 text-muted-foreground"
                        style={{
                          fontSize: "0.6875rem",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {step.duration_minutes < 60
                          ? `${step.duration_minutes} min`
                          : step.duration_minutes < 120
                            ? `1h ${step.duration_minutes - 60}min`
                            : `${Math.round(step.duration_minutes / 60)}h`}
                        {times && ` → ${fmtTime(times.end)}`}
                      </span>
                    )}
                    {/* ── Inline tip — nerd vs beginner styling ── */}
                    {tipText && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 + 0.15 }}
                        className="flex items-start gap-2.5 mt-3 px-3.5 py-2.5 rounded-xl"
                        style={{
                          background: isNerd
                            ? "color-mix(in srgb, var(--primary) 6%, var(--surface-container))"
                            : "var(--tertiary-container)",
                          border: `1px solid ${
                            isNerd
                              ? "color-mix(in srgb, var(--primary) 15%, var(--outline-variant))"
                              : "var(--outline-variant)"
                          }`,
                        }}
                      >
                        {isNerd ? (
                          <FlaskConical
                            size={12}
                            className="flex-shrink-0 mt-0.5"
                            style={{
                              color: "var(--primary)",
                              opacity: 0.7,
                            }}
                          />
                        ) : (
                          <Lightbulb
                            size={12}
                            className="flex-shrink-0 mt-0.5"
                            style={{
                              color: "var(--tertiary)",
                              opacity: 0.7,
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: isNerd
                              ? "0.75rem"
                              : "0.8125rem",
                            lineHeight: 1.55,
                            color: "var(--on-surface-variant)",
                            fontFamily: isNerd
                              ? "'DM Mono', monospace"
                              : "inherit",
                          }}
                        >
                          {tipText}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function IngRow({
  name,
  detail,
  amount,
}: {
  name: string;
  detail?: string;
  amount: number;
}) {
  return (
    <div
      className="flex items-baseline justify-between py-3"
      style={{ borderBottom: "1px solid var(--border-muted)" }}
    >
      <div className="flex items-baseline gap-2.5">
        <span
          className="text-foreground"
          style={{ fontSize: "0.9375rem" }}
        >
          {name}
        </span>
        {detail && (
          <span
            className="text-muted-foreground"
            style={{
              fontSize: "0.75rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {detail}
          </span>
        )}
      </div>
      <span
        className="text-foreground"
        style={{
          fontSize: "1.0625rem",
          fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {amount}g
      </span>
    </div>
  );
}

function getIcon(name: string) {
  const m: Record<string, typeof Clock> = {
    beaker: Beaker,
    hand: Hand,
    clock: Clock,
    scissors: Scissors,
    timer: Timer,
    expand: Expand,
    "chef-hat": ChefHat,
    flame: Flame,
  };
  return m[name] || Clock;
}
function fmtCook(sec: number) {
  return sec < 120 ? `${sec}s` : `${Math.round(sec / 60)}min`;
}

function formatIngredientsText(r: GeneratedRecipe) {
  const yeastName =
    r.yeast_type === "fresh"
      ? "Lievito fresco"
      : r.yeast_type === "dry"
        ? "Lievito secco"
        : "Lievito madre";
  return `${r.style.name} — Vulcan Pizza Lab\n${r.dough_balls} panetti da ${r.ball_weight_g}g\n\nFarina W${r.flour_w}: ${r.flour_g}g\nAcqua: ${r.water_g}g (${r.hydration_pct}%)\nSale: ${r.salt_g}g\n${yeastName}: ${r.yeast_g}g${r.oil_g > 0 ? `\nOlio: ${r.oil_g}g` : ""}\n\nTotale: ${r.total_dough_g}g`;
}

function formatProcedureText(
  r: GeneratedRecipe,
  stepTimes: { start: Date; end: Date }[],
  startTime: Date,
) {
  const lines = r.timeline.map((step, i) => {
    const t = stepTimes[i];
    const timeStr = t ? fmtTime(t.start) : step.timing_label;
    const dur =
      step.duration_minutes < 60
        ? `${step.duration_minutes}min`
        : `${Math.round(step.duration_minutes / 60)}h`;
    return `${timeStr} — ${step.title} (${dur})\n${step.description}`;
  });
  return `${r.style.name} — Procedimento\n\n${lines.join("\n\n")}`;
}