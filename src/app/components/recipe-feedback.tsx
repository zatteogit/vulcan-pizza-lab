/* ═══ RECIPE FEEDBACK — VPL-075 ═══
   Componente UI per raccogliere feedback post-cottura.
   Si mostra in fondo alla ricetta generata.
   Design: stile editoriale Cucina Editoriale, card collassabile. */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquarePlus,
  ChevronDown,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Check,
  X,
  HelpCircle,
} from "lucide-react";
import type { GeneratedRecipe } from "./pizza-engine";
import {
  type RecipeFeedback,
  type RecipeSnapshot,
  type PredictedScores,
  type RecipeIssueId,
  RECIPE_ISSUES,
  generateFeedbackId,
  saveFeedback,
} from "./feedback-store";

interface RecipeFeedbackFormProps {
  recipe: GeneratedRecipe;
  skillLevel: number;
}

export function RecipeFeedbackForm({ recipe, skillLevel }: RecipeFeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [attempted, setAttempted] = useState<boolean | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [overall, setOverall] = useState<number | null>(null);
  const [taste, setTaste] = useState<number | null>(null);
  const [texture, setTexture] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [authFelt, setAuthFelt] = useState<number | null>(null);
  const [digFelt, setDigFelt] = useState<number | null>(null);
  const [issues, setIssues] = useState<RecipeIssueId[]>([]);
  const [notes, setNotes] = useState("");

  const toggleIssue = useCallback((id: RecipeIssueId) => {
    setIssues((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const snapshot: RecipeSnapshot = {
      styleId: recipe.style.id,
      styleName: recipe.style.name,
      hydration: recipe.hydration_pct,
      flourW: recipe.flour_w,
      flourPL: recipe.flour_pl,
      fermentHours: recipe.fermentation_hours,
      fermentTemp: recipe.fermentation_temp_c,
      ovenTemp: recipe.oven_temp_c,
      ovenType: recipe.style.baking.oven_type_required,
      yeastType: recipe.yeast_type,
      yeastPct: recipe.science.yeast_baker_pct,
      skillLevel: skillLevel as 1 | 2 | 3 | 4,
      hasPreFerment: recipe.has_pre_ferment,
      compensationCount: recipe.science.compensations.length,
      doughBalls: recipe.dough_balls,
    };

    const predicted: PredictedScores = {
      authenticity: recipe.scores.authenticity,
      feasibility: recipe.scores.feasibility,
      digestibility: recipe.scores.digestibility,
      sustainability: recipe.scores.sustainability,
      experimentation: recipe.scores.experimentation,
      composite: recipe.scores.composite,
    };

    const entry: RecipeFeedback = {
      id: generateFeedbackId(),
      timestamp: new Date().toISOString(),
      recipe: snapshot,
      predicted,
      attempted: attempted === true,
      success,
      ratings: {
        overall,
        taste,
        texture,
        difficulty,
        authenticity_felt: authFelt,
        digestibility_felt: digFelt,
      },
      issues,
      notes,
    };

    saveFeedback(entry);
    setSubmitted(true);
  }, [recipe, skillLevel, attempted, success, overall, taste, texture, difficulty, authFelt, digFelt, issues, notes]);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="rounded-2xl p-6 text-center"
        style={{
          background: "var(--surface-container-low)",
          border: "1px solid var(--outline-variant)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Check style={{ color: "var(--cta)", width: 20, height: 20 }} />
          <span style={{ color: "var(--text-default)", fontSize: "0.9375rem" }}>
            Feedback salvato — grazie!
          </span>
        </div>
        <span style={{ color: "var(--muted-foreground)", fontSize: "0.8125rem" }}>
          I tuoi dati aiutano a calibrare il motore. Puoi analizzarli in DevTools → Engine Lab.
        </span>
      </motion.div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-container-low)",
        border: "1px solid var(--outline-variant)",
      }}
    >
      {/* Header — toggle */}
      <motion.button
        className="w-full flex items-center justify-between px-5 py-4 active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: "none", border: "none", cursor: "pointer" }}
        aria-expanded={isOpen}
        aria-label="Apri form feedback ricetta"
      >
        <div className="flex items-center gap-3">
          <MessageSquarePlus
            style={{ color: "var(--primary)", width: 18, height: 18 }}
          />
          <div className="text-left">
            <div style={{ color: "var(--text-default)", fontSize: "0.875rem", fontWeight: 600 }}>
              Hai provato questa ricetta?
            </div>
            <div style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>
              Il tuo feedback calibra il motore scientifico
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <ChevronDown style={{ color: "var(--muted-foreground)", width: 18, height: 18 }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-col gap-5"
              style={{ borderTop: "1px solid var(--outline-variant)" }}
            >
              {/* Step 1: Attempted? */}
              <div className="pt-4">
                <FieldLabel label="Hai provato la ricetta?" />
                <div className="flex gap-3 mt-2">
                  <ToggleButton
                    active={attempted === true}
                    onClick={() => setAttempted(true)}
                    icon={<ThumbsUp style={{ width: 14, height: 14 }} />}
                    label="Sì, l'ho fatta"
                  />
                  <ToggleButton
                    active={attempted === false}
                    onClick={() => { setAttempted(false); setSuccess(null); }}
                    icon={<ThumbsDown style={{ width: 14, height: 14 }} />}
                    label="No, solo salvata"
                  />
                </div>
              </div>

              {/* Step 2: Success? (only if attempted) */}
              {attempted === true && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <FieldLabel label="Come è andata?" />
                  <div className="flex gap-3 mt-2">
                    <ToggleButton
                      active={success === true}
                      onClick={() => setSuccess(true)}
                      icon={<Check style={{ width: 14, height: 14 }} />}
                      label="Riuscita"
                      color="var(--cta)"
                    />
                    <ToggleButton
                      active={success === false}
                      onClick={() => setSuccess(false)}
                      icon={<X style={{ width: 14, height: 14 }} />}
                      label="Non riuscita"
                      color="var(--primary)"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Ratings (only if attempted) */}
              {attempted === true && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex flex-col gap-4"
                >
                  <StarRating label="Giudizio complessivo" value={overall} onChange={setOverall} required />
                  <StarRating label="Gusto" value={taste} onChange={setTaste} />
                  <StarRating label="Consistenza / alveolatura" value={texture} onChange={setTexture} />
                  <StarRating label="Difficoltà" value={difficulty} onChange={setDifficulty} hint="1=facile, 5=impossibile" />
                  <StarRating label="Quanto sembra autentica" value={authFelt} onChange={setAuthFelt} hint="calibra A-Score" />
                  <StarRating label="Quanto è stata digeribile" value={digFelt} onChange={setDigFelt} hint="calibra D-Score" />
                </motion.div>
              )}

              {/* Step 4: Issues (only if attempted) */}
              {attempted === true && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <FieldLabel label="Problemi riscontrati" optional />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {RECIPE_ISSUES.map((issue) => (
                      <motion.button
                        key={issue.id}
                        className="rounded-xl px-3 py-1.5 active:scale-95"
                        onClick={() => toggleIssue(issue.id)}
                        style={{
                          fontSize: "0.75rem",
                          border: `1px solid ${issues.includes(issue.id) ? "var(--primary)" : "var(--outline-variant)"}`,
                          background: issues.includes(issue.id)
                            ? "var(--primary)"
                            : "var(--surface-container)",
                          color: issues.includes(issue.id)
                            ? "#ffffff"
                            : "var(--text-default)",
                          cursor: "pointer",
                          transition: "background 0.15s, border-color 0.15s, color 0.15s",
                        }}
                        aria-pressed={issues.includes(issue.id)}
                      >
                        {issue.icon} {issue.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Notes */}
              <div>
                <FieldLabel label="Note" optional />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Cosa hai cambiato? Come è venuta? Dettagli utili..."
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 mt-2 resize-none"
                  style={{
                    fontSize: "0.8125rem",
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                    color: "var(--text-default)",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Submit */}
              <motion.button
                className="w-full rounded-xl py-3 px-4 flex items-center justify-center gap-2 active:scale-95"
                onClick={handleSubmit}
                disabled={attempted === null || (attempted === true && overall === null)}
                style={{
                  background: (attempted !== null && (attempted === false || overall !== null))
                    ? "var(--cta)" : "var(--surface-container)",
                  color: (attempted !== null && (attempted === false || overall !== null))
                    ? "#ffffff" : "var(--muted-foreground)",
                  border: "none",
                  cursor: (attempted !== null && (attempted === false || overall !== null))
                    ? "pointer" : "not-allowed",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  opacity: (attempted !== null && (attempted === false || overall !== null)) ? 1 : 0.5,
                  transition: "background 0.15s, opacity 0.15s",
                }}
              >
                <Send style={{ width: 14, height: 14 }} />
                Invia feedback
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ SUB-COMPONENTS ═══

function FieldLabel({ label, optional, hint }: { label: string; optional?: boolean; hint?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "var(--text-default)", fontSize: "0.8125rem", fontWeight: 600 }}>
        {label}
      </span>
      {optional && (
        <span style={{ color: "var(--muted-foreground)", fontSize: "0.6875rem", fontStyle: "italic" }}>
          opzionale
        </span>
      )}
      {hint && (
        <span style={{ color: "var(--muted-foreground)", fontSize: "0.6875rem" }}>
          ({hint})
        </span>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color?: string;
}) {
  const activeColor = color ?? "var(--primary)";
  return (
    <motion.button
      className="rounded-xl px-4 py-2.5 flex items-center gap-2 active:scale-95"
      onClick={onClick}
      style={{
        fontSize: "0.8125rem",
        fontWeight: active ? 600 : 400,
        border: `1.5px solid ${active ? activeColor : "var(--outline-variant)"}`,
        background: active ? activeColor : "var(--surface-container)",
        color: active ? "#ffffff" : "var(--text-default)",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
      }}
      aria-pressed={active}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function StarRating({
  label,
  value,
  onChange,
  hint,
  required,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel label={label} optional={!required} hint={hint} />
      <div className="flex items-center gap-1 mt-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            className="p-1 active:scale-90"
            onClick={() => onChange(value === n ? null : n)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label={`${n} stella${n > 1 ? "e" : ""}`}
          >
            <Star
              style={{
                width: 22,
                height: 22,
                color: value !== null && n <= value ? "var(--tertiary)" : "var(--outline-variant)",
                fill: value !== null && n <= value ? "var(--tertiary)" : "none",
                transition: "color 0.15s, fill 0.15s",
              }}
            />
          </motion.button>
        ))}
        {value !== null && (
          <span
            style={{
              color: "var(--muted-foreground)",
              fontSize: "0.75rem",
              marginLeft: 4,
              fontFamily: "var(--font-mono)",
            }}
          >
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}
