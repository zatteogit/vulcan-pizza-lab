import {
  ChevronDown,
  Heart,
  HeartCrack,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CtaButton } from "../../components/ds/index";
import { useCms, type CmsContent } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import {
  getInterpretationById,
  getInterpretationsForStyle,
  type Interpretation,
} from "../../data/interpretation-library";
import {
  SCORE_DIMENSIONS,
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

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

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

  const triggerSubtitle = notice
    ? notice
    : isCanonical
      ? cmsMessage(
          cms,
          "recipeSetup.triggerCanonical",
          "Adatta idratazione, lievitazione e cottura alla tua cucina",
        )
      : summary;
  /* Il titolo del trigger dice già "Personalizza parametri": la pill
     ripete il verbo breve, non il titolo (duplicava su desktop). */
  const triggerAction = cms.ui.modify;

  return (
    <section>
      <div
        className="overflow-hidden rounded-2xl border border-[var(--recipe-setup-border)] transition-all duration-200 hover:border-[var(--tertiary)] hover:shadow-sm"
        style={{
          background: "var(--recipe-setup-bg)",
        }}
      >
        <button
          onClick={() => (onRequestOpen ? onRequestOpen() : setOpen(true))}
          className="w-full flex items-center gap-3 px-5 py-4 text-left active:scale-[0.99] transition-all duration-200 hover:bg-[color-mix(in srgb,var(--text-default)_2%,transparent)] group"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-default)",
            cursor: "pointer",
          }}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span
            className="flex items-center justify-center rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
            style={{
              width: 38,
              height: 38,
              background: "var(--recipe-setup-icon-bg)",
              color: "var(--recipe-setup-icon)",
            }}
          >
            <Sparkles size={17} />
          </span>
          <span className="flex-1 min-w-0">
            <span
              className="block"
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--weight-semibold)" as any,
                lineHeight: "var(--leading-tight)",
              }}
            >
              {cms.ui.customizeParams}
            </span>
            <motion.span
              key={triggerSubtitle}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="block truncate"
              style={{
                fontSize: "var(--font-size-md)",
                color: notice ? "var(--text-accent)" : "var(--text-muted)",
                lineHeight: "var(--leading-normal)",
                marginTop: 2,
              }}
            >
              {triggerSubtitle}
            </motion.span>
          </span>
          <span
            className="hidden sm:inline-flex rounded-full px-3 py-1"
            style={{
              color: "var(--recipe-setup-action-text)",
              background: "var(--recipe-setup-action-bg)",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {triggerAction}
          </span>
          <span className="inline-flex" style={{ color: "var(--text-muted)" }}>
            <ChevronDown size={17} style={{ transform: "rotate(-90deg)" }} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center overscroll-contain sm:items-center sm:px-4 sm:py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "var(--dialog-scrim-strong)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            }}
            onClick={() => setOpen(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="recipe-setup-title"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 34 }}
              className="w-full h-[92dvh] max-h-[92dvh] sm:h-[min(760px,88vh)] sm:max-h-[88vh] sm:max-w-[1160px] rounded-t-4xl sm:rounded-4xl border-0 sm:border overflow-hidden flex flex-col"
              style={{
                background:
                  "color-mix(in srgb, var(--container-page) 92%, transparent)",
                color: "var(--text-default)",
                borderColor: "var(--container-border)",
                boxShadow: "var(--dialog-shadow)",
                backdropFilter: "blur(24px) saturate(1.6)",
                WebkitBackdropFilter: "blur(24px) saturate(1.6)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex-shrink-0 px-5 py-3 sm:px-7 sm:py-3.5 border-b"
                style={{ borderColor: "var(--container-border-subtle)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h2
                      id="recipe-setup-title"
                      className="truncate"
                      style={{
                        fontSize:
                          "clamp(1.125rem, 4.6vw, var(--font-size-2xl))",
                        fontWeight: "var(--weight-bold)" as any,
                        margin: 0,
                        lineHeight: "var(--leading-tight)",
                      }}
                    >
                      {cms.ui.customizeParams}
                    </h2>
                    {scores && (
                      <div className="mt-2 sm:hidden">
                        <MatchSummary scores={scores} />
                      </div>
                    )}
                  </div>

                  {scores && (
                    <MatchSummary
                      scores={scores}
                      className="hidden min-w-0 flex-1 justify-end sm:flex"
                    />
                  )}

                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-full hover:bg-[color-mix(in srgb,var(--text-default)_10%,transparent)] hover:text-[var(--text-default)] active:scale-90 transition-all duration-150 flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      background: "var(--container-bg-low)",
                      border: "1px solid var(--container-border)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                    aria-label={cms.ui.close}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-8 sm:py-5 flex flex-col gap-4">
                {notice && (
                  <div
                    className="rounded-xl px-3 py-2"
                    style={{
                      background: "var(--recipe-setup-feedback-bg)",
                      color: "var(--recipe-setup-feedback-text)",
                      fontSize: "var(--font-size-md)",
                      fontWeight: "var(--weight-semibold)" as any,
                    }}
                  >
                    {notice}
                  </div>
                )}

                <div
                  className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5"
                  style={{
                    background:
                      "color-mix(in srgb, var(--tertiary) 4%, var(--surface-container-low))",
                    border:
                      "1px solid color-mix(in srgb, var(--tertiary) 10%, var(--container-border-subtle))",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span
                      style={{
                        color: "var(--tertiary)",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: "var(--weight-bold)" as any,
                        letterSpacing: "var(--tracking-spread)",
                        textTransform: "uppercase",
                      }}
                    >
                      {cmsMessage(
                        cms,
                        "recipeSetup.profileLabel",
                        "Profilo impasto",
                      )}
                    </span>
                    <span
                      className="type-body"
                      style={{ color: "var(--text-muted)", lineHeight: "1.4" }}
                    >
                      {cmsMessage(
                        cms,
                        "recipeSetup.profileHint",
                        "Scegli un preset bilanciato dai nostri pizzaioli o un'interpretazione d'autore per configurare l'impasto.",
                      )}
                    </span>
                  </div>
                  <PremiumSelect
                    value={
                      activeInterpretationId
                        ? `interpretation-${activeInterpretationId}`
                        : activeVersion
                          ? `version-${activeVersion.id}`
                          : ""
                    }
                    onChange={(val) => {
                      if (val.startsWith("version-")) {
                        const versionId = val.replace("version-", "");
                        const version = versions.find((v) => v.id === versionId);
                        if (version) {
                          onSelectVersion(version);
                        }
                      } else if (val.startsWith("interpretation-")) {
                        const interpretationId = val.replace(
                          "interpretation-",
                          "",
                        );
                        const interpretation = interpretations.find(
                          (i) => i.id === interpretationId,
                        );
                        if (interpretation) {
                          onSelectInterpretation(interpretation);
                        }
                      }
                    }}
                    groups={[
                      {
                        label: cmsMessage(cms, "recipeSetup.dough", "Impasto"),
                        options: versions.map((version) => ({
                          value: `version-${version.id}`,
                          label: localizedVersionLabel(cms, version.label),
                          subLabel: `${fmt.percent(version.params.hydration_pct)} idr. · W${version.params.flour_w}`,
                        })),
                      },
                      ...(interpretations.length > 0
                        ? [
                            {
                              label: cms.misc.signatureLabel || "Firma",
                              options: interpretations.map((interpretation) => ({
                                value: `interpretation-${interpretation.id}`,
                                label: interpretationName(interpretation),
                              })),
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>

                {children && (
                  <div
                    className="pt-4"
                    style={{
                      borderTop:
                        "1px solid var(--recipe-setup-border-subtle)",
                    }}
                  >
                    {children}
                  </div>
                )}
              </div>

              <div
                className="flex-shrink-0 flex items-center justify-end gap-3 px-5 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-3.5 border-t"
                style={{ borderColor: "var(--container-border-subtle)" }}
              >
                <CtaButton
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto px-7 py-3 active:scale-[0.98]"
                  style={{ fontSize: "var(--font-size-lg)" }}
                >
                  {cmsMessage(cms, "recipeSetup.done", "Fatto")}
                </CtaButton>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function MatchSummary({
  scores,
  className,
}: {
  scores: RecipeScores;
  className?: string;
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

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className ?? ""}`}>
      <div
        className="flex items-center"
        style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}
      >
        <span
          style={{
            fontWeight: "var(--weight-semibold)" as any,
            textTransform: "uppercase",
            fontSize: "var(--font-size-xs)",
            letterSpacing: "var(--tracking-spread)",
          }}
        >
          Match
        </span>
      </div>

      <span
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 flex-shrink-0 type-numeric"
        style={{
          background: `color-mix(in srgb, ${toneColor} 14%, transparent)`,
          color: toneColor,
          fontWeight: "var(--weight-bold)" as any,
          lineHeight: 1,
        }}
        title={tone.title}
      >
        <MatchIcon
          size={14}
          style={{ color: toneColor }}
          fill={tone.low ? "none" : toneColor}
        />
        <span style={{ fontSize: "var(--font-size-xl)" }}>{roundedScore}</span>
      </span>

      <div
        className="hidden lg:flex items-center gap-3 pl-3"
        style={{ borderLeft: "1px solid var(--container-border-subtle)" }}
      >
        {axes.map((axis) => {
          const val = Math.round(axis.value);
          return (
            <div key={axis.key} className="flex flex-col gap-1 min-w-[64px]">
              <div
                className="flex items-center justify-between"
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--text-muted)",
                }}
              >
                <span title={axis.label}>{axis.shortLabel}</span>
                <span className="type-numeric">{val}</span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "var(--container-bg-high)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ background: axis.color, width: `${val}%` }}
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
