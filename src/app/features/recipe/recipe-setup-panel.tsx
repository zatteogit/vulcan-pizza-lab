import {
  ChevronDown,
  Heart,
  HeartCrack,
  Sparkles,
  X,
  Check,
  Beaker,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CtaButton, ModalSheet } from "../../components/ds/index";
import { useCms, type CmsContent } from "../cms/cms-context";
import { createFormatter, formatTemperatureCopy, t } from "../cms/i18n";
import { SpecCell } from "./recipe-stat-strip";
import { NerdAuraBlock } from "./recipe-output-bits";
import {
  getInterpretationById,
  getInterpretationsForStyle,
  type Interpretation,
} from "../../data/interpretation-library";
import {
  SCORE_DIMENSIONS,
  type GeneratedRecipe,
  type PizzaStyle,
  type RecipeScores,
} from "../../domain/pizza-engine";
import { PremiumSelect } from "./recipe-configurator";
import { matchTone } from "./recipe-match-card";
import type { StyleVersion } from "../../data/style-versions";

function cmsMessage(cms: CmsContent, key: string, fallback: string): string {
  return cms.engineMessages?.[key] ?? fallback;
}

function localizedVersionLabel(cms: CmsContent, label: string): string {
  return cmsMessage(cms, `version.label.${label}`, label);
}

function useBodyScrollLock(locked: boolean) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!locked) return;

    const { body, documentElement } = document;
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      htmlOverflow: documentElement.style.overflow,
      htmlOverscroll: documentElement.style.overscrollBehavior,
    };

    scrollYRef.current = window.scrollY;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previous.bodyOverflow;
      body.style.paddingRight = previous.bodyPaddingRight;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      documentElement.style.overflow = previous.htmlOverflow;
      documentElement.style.overscrollBehavior = previous.htmlOverscroll;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [locked]);
}

interface RecipeSetupPanelProps {
  style: PizzaStyle;
  versions: StyleVersion[];
  activeVersion: StyleVersion | null;
  customHydration: number;
  customFlourW: number;
  customFermentHours: number;
  customFermentTemp: number;
  activeInterpretationId: string | null;
  onSelectVersion: (version: StyleVersion) => void;
  onSelectInterpretation: (interpretation: Interpretation | null) => void;
  notice: string | null;
  onNotice: (message: string | null) => void;
  openDefault?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Apertura "intelligente": adatta in silenzio se canonica, poi apre. */
  onRequestOpen?: () => void;
  isCanonical?: boolean;
  scores: RecipeScores;
  /** Gerarchia azioni (Proposta A, lug 2026): in Easy il trigger diventa una
   *  minicard discreta — "Ottimizza per me" resta l'unica azione piena. */
  compact?: boolean;
  /** Redesign lug 2026: nessun trigger proprio — l'apertura passa dal
   *  pulsante "Personalizza" della match card; qui resta solo il dialog. */
  hideTrigger?: boolean;
  /** Miniriepilogo dei parametri che la StatStrip Easy non mostra
   *  (es. "Sale 2,6% · W 200 · 22 °C"), calcolato dal chiamante. */
  advancedSummary?: string;
  /** Round 4 (lug 2026): i dati nerd non vivono più sulla scheda (accordion
   *  della strip rimosso) — se passata, la ricetta alimenta il blocco science
   *  read-only in coda al dialog (lievito, P/L, ore@18°, Q10, Aw). */
  recipe?: GeneratedRecipe | null;
  children?: ReactNode;
}

/* ═══ SETUP RICETTA — compatto, contestuale, con feedback immediato ═══ */
export function RecipeSetupPanel({
  style,
  versions,
  activeVersion,
  customHydration,
  customFlourW,
  customFermentHours,
  customFermentTemp,
  activeInterpretationId,
  onSelectVersion,
  onSelectInterpretation,
  notice,
  onNotice,
  openDefault = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onRequestOpen,
  isCanonical = false,
  scores,
  compact = false,
  hideTrigger = false,
  advancedSummary,
  recipe = null,
  children,
}: RecipeSetupPanelProps) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const [localOpen, setLocalOpen] = useState(openDefault);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen =
    controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useBodyScrollLock(open);

  /* All'apertura il focus va sul pulsante di chiusura (a11y: tastiera/VO). */
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    const attr = "data-recipe-setup-open";
    if (!open) return;
    const previous = document.body.getAttribute(attr);
    document.body.setAttribute(attr, "true");
    return () => {
      if (previous === null) {
        document.body.removeAttribute(attr);
      } else {
        document.body.setAttribute(attr, previous);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => onNotice(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [notice, onNotice]);

  const interpretations = useMemo(
    () => getInterpretationsForStyle(style.id),
    [style.id],
  );
  const activeInterpretation = activeInterpretationId
    ? interpretations.find((item) => item.id === activeInterpretationId) ??
      getInterpretationById(activeInterpretationId)
    : null;

  const activeVersionLabel = activeVersion
    ? localizedVersionLabel(cms, activeVersion.label)
    : cmsMessage(cms, "recipeSetup.styleBase", "stile base");
  /* Ridondanza: i numeri (idratazione, W, ore, temperatura) vivono già nelle
     stat card immediatamente sopra il trigger. Qui solo ciò che la strip non
     dice: il preset e l'interpretazione attivi. */
  const summary = [
    activeVersionLabel,
    activeInterpretation ? interpretationName(activeInterpretation) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  /* Riepilogo completo dei parametri "sommersi" (sale, W, temperatura,
     pre-fermento) + preset/interpretazione attivi: è la seconda riga dello
     spec-sheet Impasto, condivisa da Easy (adv-line) e Nerd (card piena). */
  const fullSummary = [
    advancedSummary,
    activeVersion ? activeVersionLabel : null,
    activeInterpretation ? interpretationName(activeInterpretation) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const triggerSubtitle = notice
    ? notice
    : isCanonical
      ? cmsMessage(
          cms,
          "recipeSetup.triggerCanonical",
          "Adatta idratazione, lievitazione e cottura alla tua cucina",
        )
      : fullSummary || summary;
  /* Il titolo del trigger dice già "Personalizza parametri": la pill
     ripete il verbo breve, non il titolo (duplicava su desktop). */
  const triggerAction = cms.ui.modify;

  /* Adv-line Easy: notice in tempo reale se presente, altrimenti il riepilogo
     completo. */
  const compactSummary = notice ?? fullSummary;

  return (
    <section>
      {hideTrigger ? null : compact ? (
        /* Adv-line (redesign lug 2026): seconda riga dello spec-sheet, niente
           scatola — PRIMA i dati (riepilogo dei valori sommersi: sale, W,
           temperatura, preset), POI la leva "Regola a mano ›" a chiuderla.
           Solo la leva ha aspetto cliccabile. */
        <button
          onClick={() => (onRequestOpen ? onRequestOpen() : setOpen(true))}
          className="setup-trigger setup-trigger--compact"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          {compactSummary && (
            <motion.span
              key={compactSummary}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                notice
                  ? "setup-trigger__summary setup-trigger__summary--notice"
                  : "setup-trigger__summary"
              }
            >
              {compactSummary}
            </motion.span>
          )}
          <span className="setup-trigger__link">
            {cms.ui.adjustByHand ?? "Regola a mano"}
            <ChevronDown
              size={13}
              className="setup-trigger__link-icon"
              aria-hidden="true"
            />
          </span>
        </button>
      ) : (
        <button
          onClick={() => (onRequestOpen ? onRequestOpen() : setOpen(true))}
          className="setup-trigger"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span className="setup-trigger__icon">
            <Sparkles size={17} />
          </span>
          <span className="setup-trigger__text">
            <span className="setup-trigger__title">
              {cms.ui.customizeParams}
            </span>
            <motion.span
              key={triggerSubtitle}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                notice
                  ? "setup-trigger__subtitle setup-trigger__subtitle--notice"
                  : "setup-trigger__subtitle"
              }
            >
              {triggerSubtitle}
            </motion.span>
          </span>
          <span className="setup-trigger__action">{triggerAction}</span>
          <span className="setup-trigger__chevron">
            <ChevronDown size={17} className="setup-trigger__chevron-icon" />
          </span>
        </button>
      )}

      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        ariaLabelledby="recipe-setup-title"
        size="xl"
        height="full"
        panelClassName="setup-panel"
      >
        <div className="setup-header">
          <div className="setup-header__row">
            <div className="setup-header__titlewrap">
              <h2 id="recipe-setup-title" className="setup-header__title">
                {cms.ui.customizeParams}
              </h2>
              {scores && (
                <div className="setup-header__match-mobile">
                  <MatchSummary scores={scores} />
                </div>
              )}
            </div>

            {scores && <MatchSummary scores={scores} variant="desktop" />}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              className="setup-header__close"
              aria-label={cms.ui.close}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="setup-body">
          {notice && <div className="setup-notice">{notice}</div>}

          <div className="setup-profile">
            <div className="setup-profile__intro">
              <span className="setup-profile__label">
                {cmsMessage(cms, "recipeSetup.profileLabel", "Profilo impasto")}
              </span>
              <span className="type-body setup-profile__hint">
                {cmsMessage(
                  cms,
                  "recipeSetup.profileHint",
                  "Scegli un preset bilanciato dai nostri pizzaioli o un'interpretazione d'autore per configurare l'impasto.",
                )}
              </span>
            </div>
            <div className="setup-profile__body">
              <div
                className="setup-versions setup-versions--binary"
                role="group"
                aria-label={cmsMessage(cms, "recipeSetup.profileLabel", "Profilo impasto")}
              >
                {versions.map((version) => {
                  const active = !activeInterpretationId && activeVersion?.id === version.id;
                  return (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => onSelectVersion(version)}
                      className={active ? "setup-option setup-option--binary setup-option--active" : "setup-option setup-option--binary"}
                    >
                      <div className="setup-option__text">
                        <span className="setup-option__name">
                          {localizedVersionLabel(cms, version.label)}
                        </span>
                        <span className="setup-option__detail">
                          {fmt.percent(version.params.hydration_pct)} idr. · W{version.params.flour_w}
                        </span>
                      </div>
                      {active && <Check size={16} className="setup-option__check" />}
                    </button>
                  );
                })}
              </div>

              {interpretations.length > 0 && (
                <div className="setup-signatures">
                  <div className="setup-signatures__label">
                    {cms.misc.signatureLabel || "Firma"}
                  </div>
                  {interpretations.map((interpretation) => {
                    const active = activeInterpretationId === interpretation.id;
                    return (
                      <button
                        key={interpretation.id}
                        type="button"
                        onClick={() => onSelectInterpretation(interpretation)}
                        className={active ? "setup-option setup-option--active" : "setup-option"}
                      >
                        <div className="setup-option__text">
                          <span className="setup-option__name">
                            {interpretationName(interpretation)}
                          </span>
                          <span className="setup-option__detail">
                            {interpretation.author ?? interpretation.pizzeria ?? "D'autore"}
                          </span>
                        </div>
                        {active && <Check size={16} className="setup-option__check" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {children && <div className="setup-children">{children}</div>}

          {/* ── Dati science (round 4): read-only, derivati dalla
              ricetta corrente — erano l'accordion della StatStrip. ── */}
          {recipe?.science && (
            <div className="setup-science">
              <span className="setup-science__label">
                <Beaker size={13} className="setup-science__icon" />
                {bcp47.startsWith("it") ? "Parametri nerd" : "Nerd parameters"}
              </span>
              <NerdAuraBlock compact>
                <div className="setup-science__grid">
                  <SpecCell
                    small
                    science
                    label={cms.ui.nerdYeast}
                    value={fmt.percent(recipe.science.yeast_baker_pct)}
                    index={0}
                  />
                  <SpecCell
                    small
                    science
                    label={cms.ui.nerdPL}
                    value={`${recipe.flour_pl}`}
                    index={1}
                  />
                  <SpecCell
                    small
                    science
                    label={t(
                      formatTemperatureCopy(cms.ui.nerdHoursAt18, fmt),
                      { refTemp: fmt.celsius(18) },
                    )}
                    value={fmt.fermentTime(
                      Number(recipe.science.effective_hours_18c),
                    )}
                    index={2}
                  />
                  <SpecCell
                    small
                    science
                    label={t(
                      formatTemperatureCopy(cms.ui.nerdQ10, fmt),
                      { refTemp: fmt.celsius(18) },
                    )}
                    value={`${recipe.science.q10_factor}×`}
                    index={3}
                  />
                  <SpecCell
                    small
                    science
                    label={cms.ui.nerdAw}
                    value={`${recipe.science.water_activity}`}
                    index={4}
                  />
                </div>
              </NerdAuraBlock>
            </div>
          )}
        </div>

        <div className="setup-footer">
          <CtaButton
            type="button"
            onClick={() => setOpen(false)}
            className="setup-footer__cta"
          >
            {cmsMessage(cms, "recipeSetup.done", "Fatto")}
          </CtaButton>
        </div>
      </ModalSheet>
    </section>
  );
}

function MatchSummary({
  scores,
  variant,
}: {
  scores: RecipeScores;
  variant?: "mobile" | "desktop";
}) {
  const { cms } = useCms();
  const roundedScore = Math.round(scores.composite);
  const tone = matchTone(roundedScore, "adapted", cms.cooking.matchTones);
  const axes = SCORE_DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    color: dimension.color,
    label: cms.scoreDimensions[dimension.key]?.label ?? dimension.label,
    shortLabel: cms.scoreDimensions[dimension.key]?.short ?? dimension.short,
    value: scores[dimension.key],
  }));

  const toneColor = tone.low ? "var(--text-warning)" : "var(--text-accent)";
  const MatchIcon = tone.low ? HeartCrack : Heart;
  const rootClass =
    variant === "desktop" ? "setup-match setup-match--desktop" : "setup-match";
  const iconClass = tone.low
    ? "setup-match__icon setup-match__icon--low"
    : "setup-match__icon";

  return (
    <div className={rootClass}>
      <div className="setup-match__label-wrap">
        <span className="setup-match__label">Match</span>
      </div>

      <span
        className="setup-match__score"
        style={{ ["--tone" as any]: toneColor }}
        title={tone.title}
      >
        <MatchIcon size={14} className={iconClass} />
        <span className="setup-match__value">{roundedScore}</span>
      </span>

      <div className="setup-match__axes">
        {axes.map((axis) => {
          const val = Math.round(axis.value);
          return (
            <div key={axis.key} className="setup-match__axis">
              <div className="setup-match__axis-row">
                <span title={axis.label}>{axis.shortLabel}</span>
                <span className="type-numeric">{val}</span>
              </div>
              <div className="setup-match__track">
                <div
                  className="setup-match__fill"
                  style={{
                    ["--axis-color" as any]: axis.color,
                    ["--axis-width" as any]: `${val}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function interpretationName(interpretation: Interpretation): string {
  return (
    interpretation.author ??
    interpretation.pizzeria ??
    interpretation.organization ??
    interpretation.signature_name ??
    "Interpretazione"
  );
}
