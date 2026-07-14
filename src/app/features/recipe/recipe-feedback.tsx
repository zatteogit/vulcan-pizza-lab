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
import { motionSpring } from "../../components/ds/motion";
import { useCallback,useState } from "react";
import { useCms } from "../cms/cms-context";
import {
type PredictedScores,
type RecipeFeedback,
type RecipeIssueId,
type RecipeSnapshot,
RECIPE_ISSUES,
generateFeedbackId,
saveFeedback,
} from "./feedback-store";
import type { GeneratedRecipe } from "../../domain/pizza-engine";

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
        transition={motionSpring.standard}
        className="recipe-feedback recipe-feedback--saved"
      >
        <div className="recipe-feedback__saved-head">
          <Check className="recipe-feedback__saved-icon" />
          <span className="recipe-feedback__saved-title">
            {cms.feedback.savedTitle}
          </span>
        </div>
        <span className="recipe-feedback__saved-body type-body">
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
            <div className="recipe-feedback__corrections">
              <div className="recipe-feedback__corrections-head">
                <Sparkles size={13} aria-hidden="true" />
                {cms.feedback.nextTimeTitle}
              </div>
              <ul className="recipe-feedback__corrections-list">
                {corrections.map((c, i) => (
                  <li key={i} className="recipe-feedback__corrections-item">
                    <span className="recipe-feedback__corrections-bullet">·</span>
                    <span className="recipe-feedback__corrections-text">{c}</span>
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
      <div className="recipe-feedback recipe-feedback--prompt">
        <div className="recipe-feedback__intro">
          <div className="recipe-feedback__intro-title">
            {cms.feedback.triedQuestion}
          </div>
          <div className="recipe-feedback__intro-subtitle type-body">
            {cms.feedback.triedSubtitle}
          </div>
        </div>
        <div className="recipe-feedback__actions">
          <button
            onClick={() => {
              setSuccess(true);
              setHasDecision(true);
            }}
            className="recipe-feedback__decision-btn"
          >
            <ThumbsUp
              size={14}
              className="recipe-feedback__decision-icon recipe-feedback__decision-icon--success"
            />
            <span className="recipe-feedback__decision-label">{cms.feedback.success}</span>
          </button>
          <button
            onClick={() => {
              setSuccess(false);
              setHasDecision(true);
            }}
            className="recipe-feedback__decision-btn"
          >
            <ThumbsDown
              size={14}
              className="recipe-feedback__decision-icon recipe-feedback__decision-icon--fail"
            />
            <span className="recipe-feedback__decision-label">{cms.feedback.fail}</span>
          </button>
        </div>
      </div>
    );
  }

  // State 2: Prompt for detailed review
  if (hasDecision && !showFullForm) {
    return (
      <div className="recipe-feedback recipe-feedback--detail">
        <div className="recipe-feedback__intro">
          <div className="recipe-feedback__intro-title">
            {cms.feedback.detailedPrompt}
          </div>
          <div className="recipe-feedback__intro-subtitle type-body">
            {cms.feedback.detailedSubtitle}
          </div>
        </div>
        <div className="recipe-feedback__actions">
          <button
            onClick={() => setShowFullForm(true)}
            className="recipe-feedback__cta-btn"
          >
            {cms.misc.feedbackYes}
          </button>
          <button
            onClick={handleSubmitBasic}
            className="recipe-feedback__ghost-btn"
          >
            {cms.misc.feedbackNo}
          </button>
        </div>
      </div>
    );
  }

  // State 3: Show full review questionnaire
  return (
    <div className="recipe-feedback recipe-feedback--full">
      <div className="recipe-feedback__header">
        <div className="recipe-feedback__header-copy">
          <span className="recipe-feedback__header-title type-body-lg">
            {cms.feedback.detailedTitle}
          </span>
          <span className="recipe-feedback__header-subtitle type-body-sm">
            {success ? cms.feedback.recipeSuccess : cms.feedback.recipeFail}
          </span>
        </div>
        <button
          onClick={() => setShowFullForm(false)}
          className="recipe-feedback__close-btn"
          title={cms.ui.back}
          aria-label={cms.ui.back}
        >
          <X size={16} />
        </button>
      </div>

      <div className="recipe-feedback__body">
        {/* Rating questions */}
        <StarRating label={cms.feedback.ratingOverall} value={overall} onChange={setOverall} required />
        <StarRating label={cms.feedback.ratingTaste} value={taste} onChange={setTaste} />
        <StarRating label={cms.feedback.ratingTexture} value={texture} onChange={setTexture} />
        <StarRating label={cms.feedback.ratingDifficulty} value={difficulty} onChange={setDifficulty} hint={cms.feedback.ratingDifficultyHint} />
        <StarRating label={cms.feedback.ratingAuth} value={authFelt} onChange={setAuthFelt} hint={cms.feedback.ratingAuthHint} />
        <StarRating label={cms.feedback.ratingDig} value={digFelt} onChange={setDigFelt} hint={cms.feedback.ratingDigHint} />

        {/* Issues checklist */}
        <div className="recipe-feedback__field">
          <FieldLabel label={cms.feedback.issuesLabel} optional />
          <div className="recipe-feedback__issue-list">
            {RECIPE_ISSUES.map((issue) => (
              <motion.button
                key={issue.id}
                className={`recipe-feedback__issue-chip${issues.includes(issue.id) ? " recipe-feedback__issue-chip--active" : ""}`}
                onClick={() => toggleIssue(issue.id)}
                aria-pressed={issues.includes(issue.id)}
              >
                {issue.icon} {issue.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Text area notes */}
        <div className="recipe-feedback__field">
          <FieldLabel label={cms.feedback.notesLabel} optional />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={cms.misc.feedbackPlaceholder}
            rows={2}
            className="recipe-feedback__notes"
          />
        </div>

        {/* Submit */}
        <motion.button
          className={`recipe-feedback__submit-btn${overall !== null ? " recipe-feedback__submit-btn--active" : ""}`}
          onClick={handleSubmit}
          disabled={overall === null}
        >
          <Send className="recipe-feedback__submit-icon" />
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
    <div className="recipe-feedback__field-label">
      <span className="recipe-feedback__field-label-text type-body">
        {label}
      </span>
      {optional && (
        <span className="recipe-feedback__field-label-optional type-body-xs">
          {cms.ui.pantryOptional}
        </span>
      )}
      {hint && (
        <span className="recipe-feedback__field-label-hint type-body-xs">
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
    <div className="recipe-feedback__rating">
      <FieldLabel label={label} optional={!required} hint={hint} />
      <div className="recipe-feedback__star-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            className="recipe-feedback__star-btn"
            onClick={() => onChange(value === n ? null : n)}
            aria-label={`${n} ${n === 1 ? "stella" : "stelle"}`}
          >
            <Star
              className={`recipe-feedback__star-icon${value !== null && n <= value ? " recipe-feedback__star-icon--filled" : ""}`}
            />
          </motion.button>
        ))}
        {value !== null && (
          <span className="recipe-feedback__star-value">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}
