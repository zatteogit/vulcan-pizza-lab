/* ═══ RECIPE FEEDBACK — VPL-075 ═══
   Componente UI per raccogliere feedback post-cottura.
   Si mostra in fondo alla ricetta generata.
   Design: stile editoriale Cucina Editoriale, card collassabile. */

import {
Check,
Send,
Sparkles,
Star,
ThumbsDown,
ThumbsUp,
X
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback,useState } from "react";
import { useCms } from "./cms/cms-context";
import {
type PredictedScores,
type RecipeFeedback,
type RecipeIssueId,
type RecipeSnapshot,
RECIPE_ISSUES,
generateFeedbackId,
saveFeedback,
} from "./feedback-store";
import type { GeneratedRecipe } from "./pizza-engine";

interface RecipeFeedbackFormProps {
  recipe: GeneratedRecipe;
  skillLevel: number;
}

export function RecipeFeedbackForm({ recipe, skillLevel }: RecipeFeedbackFormProps) {
  const { cms } = useCms();
  const [submitted, setSubmitted] = useState(false);

  // Progressive flow states
  const [success, setSuccess] = useState<boolean | null>(null);
  const [hasDecision, setHasDecision] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);

  // Form details state
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

  const handleSubmitBasic = useCallback(() => {
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
      attempted: true,
      success,
      ratings: {
        overall: null,
        taste: null,
        texture: null,
        difficulty: null,
        authenticity_felt: null,
        digestibility_felt: null,
      },
      issues: [],
      notes: "",
    };

    saveFeedback(entry);
    setSubmitted(true);
  }, [recipe, skillLevel, success]);

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
      attempted: true,
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
  }, [recipe, skillLevel, success, overall, taste, texture, difficulty, authFelt, digFelt, issues, notes]);

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
          <Check style={{ color: "var(--cta)", width: "var(--space-5)", height: "var(--space-5)" }} />
          <span style={{ color: "var(--text-default)", fontSize: "var(--font-size-xl)" }}>
            {cms.feedback.savedTitle}
          </span>
        </div>
        <span className="type-body" style={{ color: "var(--muted-foreground)" }}>
          {cms.feedback.savedBody}
        </span>

        {/* VPL-C11: chiusura di valore — cosa correggerà l'engine la prossima
            volta, in base ai problemi segnalati (correzioni deduplicate). */}
        {(() => {
          const corrections = Array.from(
            new Set(
              issues.flatMap((id) => {
                const c = RECIPE_ISSUES.find((i) => i.id === id)?.correction;
                return c ? [c as string] : [];
              }),
            ),
          );
          if (corrections.length === 0) return null;
          return (
            <div
              className="mt-5 text-left rounded-xl p-4"
              style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)" }}
            >
              <div
                className="flex items-center gap-1.5"
                style={{
                  color: "var(--text-accent)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--weight-bold)" as any,
                  letterSpacing: "var(--tracking-caps)",
                  textTransform: "uppercase",
                  marginBottom: "var(--space-2)",
                }}
              >
                <Sparkles size={13} aria-hidden="true" />
                {cms.feedback.nextTimeTitle}
              </div>
              <ul className="flex flex-col gap-1.5">
                {corrections.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2"
                    style={{ color: "var(--text-default)", fontSize: "var(--font-size-md)", lineHeight: "var(--leading-normal)" }}
                  >
                    <span style={{ color: "var(--text-accent)", flexShrink: 0 }}>·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </motion.div>
    );
  }

  // State 1: Condensed initial question
  if (!hasDecision) {
    return (
      <div
        className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left"
        style={{
          background: "var(--surface-container-low)",
          border: "1px solid var(--outline-variant)",
        }}
      >
        <div>
          <div style={{ color: "var(--text-default)", fontSize: "var(--font-size-xl)", fontWeight: 600 }}>
            {cms.feedback.triedQuestion}
          </div>
          <div className="type-body" style={{ color: "var(--muted-foreground)", marginTop: "var(--space-0-5)" }}>
            {cms.feedback.triedSubtitle}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSuccess(true);
              setHasDecision(true);
            }}
            className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl transition-all active:scale-95"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
              color: "var(--text-default)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <ThumbsUp size={14} className="text-success" style={{ color: "var(--icon-success)" }} />
            <span>{cms.feedback.success}</span>
          </button>
          <button
            onClick={() => {
              setSuccess(false);
              setHasDecision(true);
            }}
            className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl transition-all active:scale-95"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
              color: "var(--text-default)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <ThumbsDown size={14} style={{ color: "var(--primary)" }} />
            <span>{cms.feedback.fail}</span>
          </button>
        </div>
      </div>
    );
  }

  // State 2: Prompt for detailed review
  if (hasDecision && !showFullForm) {
    return (
      <div
        className="rounded-2xl p-5 flex flex-col gap-4 text-left"
        style={{
          background: "var(--surface-container-low)",
          border: "1px solid var(--outline-variant)",
        }}
      >
        <div>
          <div style={{ color: "var(--text-default)", fontSize: "var(--font-size-xl)", fontWeight: 600 }}>
            {cms.feedback.detailedPrompt}
          </div>
          <div className="type-body" style={{ color: "var(--muted-foreground)", marginTop: "var(--space-0-5)" }}>
            {cms.feedback.detailedSubtitle}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFullForm(true)}
            className="h-9 px-4 rounded-xl"
            style={{
              background: "var(--cta)",
              color: "var(--overlay-text)",
              fontSize: "var(--font-size-md)",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
            }}
          >
            {cms.misc.feedbackYes}
          </button>
          <button
            onClick={handleSubmitBasic}
            className="h-9 px-4 rounded-xl"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
              color: "var(--text-muted)",
              fontSize: "var(--font-size-md)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {cms.misc.feedbackNo}
          </button>
        </div>
      </div>
    );
  }

  // State 3: Show full review questionnaire
  return (
    <div
      className="rounded-2xl overflow-hidden text-left"
      style={{
        background: "var(--surface-container-low)",
        border: "1px solid var(--outline-variant)",
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--outline-variant)" }}
      >
        <div>
          <span className="type-body-lg" style={{ color: "var(--text-default)", fontWeight: 600 }}>
            {cms.feedback.detailedTitle}
          </span>
          <span className="type-body-sm" style={{ display: "block", color: "var(--muted-foreground)", marginTop: "var(--space-0-5)" }}>
            {success ? cms.feedback.recipeSuccess : cms.feedback.recipeFail}
          </span>
        </div>
        <button
          onClick={() => setShowFullForm(false)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 4,
          }}
          title={cms.ui.back}
          aria-label={cms.ui.back}
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-5 pb-5 pt-4 flex flex-col gap-5">
        {/* Rating questions */}
        <StarRating label={cms.feedback.ratingOverall} value={overall} onChange={setOverall} required />
        <StarRating label={cms.feedback.ratingTaste} value={taste} onChange={setTaste} />
        <StarRating label={cms.feedback.ratingTexture} value={texture} onChange={setTexture} />
        <StarRating label={cms.feedback.ratingDifficulty} value={difficulty} onChange={setDifficulty} hint={cms.feedback.ratingDifficultyHint} />
        <StarRating label={cms.feedback.ratingAuth} value={authFelt} onChange={setAuthFelt} hint={cms.feedback.ratingAuthHint} />
        <StarRating label={cms.feedback.ratingDig} value={digFelt} onChange={setDigFelt} hint={cms.feedback.ratingDigHint} />

        {/* Issues checklist */}
        <div>
          <FieldLabel label={cms.feedback.issuesLabel} optional />
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
                    ? "var(--overlay-text)"
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
        </div>

        {/* Text area notes */}
        <div>
          <FieldLabel label={cms.feedback.notesLabel} optional />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={cms.misc.feedbackPlaceholder}
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
          disabled={overall === null}
          style={{
            background: overall !== null ? "var(--cta)" : "var(--surface-container)",
            color: overall !== null ? "var(--overlay-text)" : "var(--muted-foreground)",
            border: "none",
            cursor: overall !== null ? "pointer" : "not-allowed",
            fontSize: "var(--font-size-lg)",
            fontWeight: 600,
            opacity: overall !== null ? 1 : 0.5,
            transition: "background 0.15s, opacity 0.15s",
          }}
        >
          <Send style={{ width: "var(--font-size-lg)", height: "var(--font-size-lg)" }} />
          {cms.feedback.submit}
        </motion.button>
      </div>
    </div>
  );
}

// ═══ SUB-COMPONENTS ═══

function FieldLabel({ label, optional, hint }: { label: string; optional?: boolean; hint?: string }) {
  const { cms } = useCms();
  return (
    <div className="flex items-center gap-2">
      <span className="type-body" style={{ color: "var(--text-default)", fontWeight: 600 }}>
        {label}
      </span>
      {optional && (
        <span className="type-body-xs" style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>
          {cms.ui.pantryOptional}
        </span>
      )}
      {hint && (
        <span className="type-body-xs" style={{ color: "var(--muted-foreground)" }}>
          ({hint})
        </span>
      )}
    </div>
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
            aria-label={`${n} ${n === 1 ? "stella" : "stelle"}`}
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
