import { Check, CookingPot, Flame, Link as LinkIcon, ListChecks, Share2, Utensils } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React, { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ScrollToTopOnMount } from "./recipe-output-bits";
import { ToppingSection } from "./topping-section";
import { ProcedureHeroControls } from "./procedure-hero";
import { IngredientsSection } from "./ingredients-section";
import { ProcedureTimeline } from "./procedure-timeline";
import { addMinutes, localizeStep, optimizeComfort, roundToQuarter, getServingUnitLabel, toppingSectionLabel } from "./recipe-output-format";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { FLEXIBLE_STEP_IDS, useCookSession, type CookSessionStep } from "../cooking/cook-session";
import type { FlourEntry } from "../../data/flour-database";
import { GeneratedRecipe, generateTimeSlots, getServingUnit, needsPan, UserConstraints, type PanConfig } from "../../domain/pizza-engine";
import { RecipeFeedbackForm } from "./recipe-feedback";
import { getRecipesByAuthenticity, getToppingForStyle } from "../../data/topping-library";
import { ConfirmDialog, IconButton } from "../../components/ds/index";
import { motionSpring } from "../../components/ds/motion";


interface RecipeOutputProps {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
  nerdMode?: boolean;
  /** Vista Semplice: gergo tecnico sostituito da parole (audit roleplay). */
  simple?: boolean;
  selectedFlourId?: string | null;
  onSelectFlour?: (flour: FlourEntry | null) => void;
  selectedTimeSlotId?: string | null;
  /** Config teglia attiva — usata per mostrare le dimensioni accanto al
   *  conteggio (co-locazione UI proximity #54). Se assente, fallback ai
   *  default dello stile. */
  panConfig?: PanConfig;
  /** La pagina ricetta può controllare la sezione primaria per evitare tab annidate. */
  forcedTab?: PagerTabId;
  hidePager?: boolean;
  hideContextSummary?: boolean;
  recipeControls?: ReactNode;
  matchSlot?: ReactNode;
  showFeedback?: boolean;
  selectedToppingConcept?: string | null;
  onSelectTopping?: (conceptId: string) => void;
  onTabChange?: (tab: PagerTabId) => void;
  shareUrl?: string;
  nerdAvailable?: boolean;
  onNerdModeChange?: (nerd: boolean) => void;
  isPersonalized?: boolean;
  onRequestPersonalization?: () => void;
  /** Nasconde la capsula flottante in alto a destra (Inizia + condividi):
   *  usato nella sezione Crea, dove la shell ha già il pulsante Profilo lì e
   *  l'azione "Inizia" vive nel grande bottone della timeline. */
}

/* ═══ Pager orizzontale (feedback giugno 2026) ═══ */
type PagerTabId = "ricetta" | "procedimento" | "condimento";

const panelVariants = {
  enter: (custom?: { direction: number; reduceMotion: boolean }) => ({
    x: custom?.reduceMotion ? 0 : (custom?.direction ?? 0) > 0 ? 120 : -120,
    y: custom?.reduceMotion ? 8 : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
  },
  exit: (custom?: { direction: number; reduceMotion: boolean }) => ({
    x: custom?.reduceMotion ? 0 : (custom?.direction ?? 0) < 0 ? 120 : -120,
    y: custom?.reduceMotion ? -6 : 0,
    opacity: 0,
  }),
};

export function RecipeOutput({
  recipe,
  constraints,
  onConstraintsChange,
  nerdMode,
  simple,
  selectedTimeSlotId,
  panConfig,
  forcedTab,
  hidePager = false,
  hideContextSummary = false,
  recipeControls,
  matchSlot,
  showFeedback = false,
  selectedToppingConcept,
  onSelectTopping,
  onTabChange,
  shareUrl,
  nerdAvailable = false,
  onNerdModeChange,
  isPersonalized = true,
  onRequestPersonalization,
}: RecipeOutputProps) {
  const reduceMotion = useReducedMotion();
  const [linkCopied, setLinkCopied] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    setPortalTarget(document.getElementById("recipe-header-actions"));
  }, []);

  /* Warning prima di rimpiazzare una pizzata in corso di un ALTRO stile:
     avviarne una nuova sovrascrive timer e progresso di quella attiva. */
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmPersonalize, setConfirmPersonalize] = useState(false);
  /* Audit motore 2026-05: spiegazione Regola 55 espandibile per mobile (su
     desktop c'è già il tooltip via title, ma su touch non è raggiungibile). */
  const [showRule55Tip, setShowRule55Tip] = useState(false);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        },
        () => fallbackCopy(shareUrl)
      );
    } else {
      fallbackCopy(shareUrl);
    }

    function fallbackCopy(text: string) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      document.body.removeChild(ta);
    }
  };

  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  const rule55Description = t(cms.cooking.rule55Description, {
    target: fmt.unitSystem === "imperial"
      ? (bcp47.toLowerCase().startsWith("it") ? "55 in scala Celsius" : "55 on the Celsius scale")
      : fmt.celsius(55),
    final: fmt.celsius(25),
    frictionMin: fmt.celsiusDelta(1),
    frictionMax: fmt.celsiusDelta(3),
  });

  /* Label contestuale per il selettore di porzioni ("Panetti" / "Teglie" / ...). */
  const servingUnit = getServingUnit(recipe.style);
  const allToppingChoices = React.useMemo(() => {
    const ranked = getRecipesByAuthenticity(recipe.style).filter(
      (item) => item.authenticity !== "taboo",
    );
    /* «Ogni stile ha i suoi topping»: una sola voce per concept, tenendo la
       variante più specifica per questo stile. La lista è già ordinata per
       autenticità (canonical → natural → common → …), quindi il primo match
       per concept è quello giusto: evita doppioni tipo "Margherita Verace" +
       "Margherita classica" o "Capricciosa napoletana" + "Capricciosa classica". */
    const seen = new Set<string>();
    return ranked.filter((item) => {
      const key = item.recipe.concept_ref;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [recipe.style]);
  const toppingChoices = React.useMemo(() => {
    /* Modello per-stile: getRecipesByAuthenticity ritorna SOLO i condimenti
       assegnati a questo stile (già esclusi i taboo). Sono tutti il "menù"
       dello stile → li mostriamo tutti, incluse le innovazioni/sperimentazioni
       (tier "experimental"), che l'ordinamento tiene comunque in coda. */
    const featured = allToppingChoices.filter(
      (item) => item.authenticity !== "taboo",
    );
    const activeConceptId = selectedToppingConcept ?? null;
    if (
      activeConceptId &&
      !featured.some((item) => item.recipe.id === activeConceptId)
    ) {
      const activeChoice = allToppingChoices.find(
        (item) => item.recipe.id === activeConceptId,
      );
      if (activeChoice) return [activeChoice, ...featured];
    }
    return featured;
  }, [allToppingChoices, selectedToppingConcept]);

  const activeTopping = React.useMemo(() => {
    const selectedTopping = selectedToppingConcept
      ? getToppingForStyle(selectedToppingConcept, recipe.style)
      : undefined;
    const fallbackToppingRefId = recipe.style.default_topping_ref;
    return (
      selectedTopping ??
      toppingChoices[0]?.recipe ??
      (fallbackToppingRefId
        ? getToppingForStyle(fallbackToppingRefId, recipe.style)
        : undefined) ??
      allToppingChoices.find((c) => c.authenticity !== "taboo")?.recipe
    );
  }, [selectedToppingConcept, recipe.style, toppingChoices, allToppingChoices]);

  /* UI proximity #54 — dimensioni teglia accanto al conteggio: solo per gli
     stili che usano una teglia/contenitore. Usa la config attiva (se
     personalizzata) altrimenti i default dello stile. Es. "40×30 cm" o "Ø28 cm". */
  const panSizeLabel = (() => {
    if (!needsPan(recipe.style)) return null;
    const shape = recipe.style.shape;
    const isRound =
      (panConfig?.panShape ?? shape.shape_type) === "round";
    if (isRound) {
      const d = panConfig?.panDiameter ?? shape.diameter_cm;
      return d ? `Ø${Math.round(d)} cm` : null;
    }
    const l = panConfig?.panLength ?? shape.length_cm;
    const w = panConfig?.panWidth ?? shape.width_cm;
    return l && w ? `${Math.round(l)}×${Math.round(w)} cm` : null;
  })();

  /* ═══ Smart start time — back-calculate from eating time ═══
     If the user selected a time slot, we know WHEN they want to eat
     (now + available_hours). We subtract the total recipe duration
     to get the ideal start time. Falls back to "now" rounded. */
  const totalDurationMinStatic = React.useMemo(
    () => recipe.timeline.reduce((sum, s) => sum + s.duration_minutes, 0),
    [recipe.timeline],
  );

  const [startTime, setStartTime] = useState(() => {
    if (selectedTimeSlotId && selectedTimeSlotId !== "no_preference" && constraints.available_hours > 0) {
      const eatingTime = new Date(Date.now() + constraints.available_hours * 3600_000);
      const idealStart = new Date(eatingTime.getTime() - totalDurationMinStatic * 60_000);
      // If ideal start is in the past, use now + 15min rounded
      if (idealStart.getTime() < Date.now()) {
        return roundToQuarter(new Date());
      }
      return roundToQuarter(idealStart);
    }
    return roundToQuarter(new Date());
  });

  const [editingTime, setEditingTime] = useState(false);
  const [editingEndTime, setEditingEndTime] = useState(false);

  const showNerdToggle = nerdAvailable && !!onNerdModeChange;
  const isNerd = showNerdToggle && !!nerdMode;

  /* ── Timeline comoda (feedback giugno 2026): minuti extra per fase ──
   * Le fasi flessibili possono stirarsi/accorciarsi entro tolleranze: un'ora
   * in più di frigo non cambia la pizza, ma evita la sveglia alle 5. */
  const [stretch, setStretch] = useState<Record<number, number>>({});
  const effDuration = React.useCallback(
    (i: number) => recipe.timeline[i].duration_minutes + (stretch[i] ?? 0),
    [recipe.timeline, stretch],
  );

  /* Reset dello stretch quando cambia la ricetta */
  const timelineKey = recipe.timeline.map((s) => s.id + s.duration_minutes).join("|");
  const prevTimelineKey = React.useRef(timelineKey);
  React.useEffect(() => {
    if (prevTimelineKey.current !== timelineKey) {
      prevTimelineKey.current = timelineKey;
      setStretch({});
    }
  }, [timelineKey]);

  const stepTimes = React.useMemo(() => {
    let cursor = new Date(startTime);
    return recipe.timeline.map((step, i) => {
      const start = new Date(cursor);
      const end = addMinutes(cursor, step.duration_minutes + (stretch[i] ?? 0));
      cursor = end;
      return { start, end };
    });
  }, [recipe.timeline, startTime, stretch]);

  /* ═══ Pager orizzontale: Ricetta | Procedimento ═══ */
  const pagerTabs = React.useMemo(
    () => [
      { id: "ricetta" as PagerTabId, label: forcedTab ? cms.cooking.tabRecipe : cms.cooking.tabRecipeTailored, icon: CookingPot },
      { id: "procedimento" as PagerTabId, label: cms.cooking.tabProcedure, icon: ListChecks },
      { id: "condimento" as PagerTabId, label: toppingSectionLabel(recipe.style, cms), icon: Utensils },
    ],
    [
      cms.cooking.tabProcedure,
      cms.cooking.tabRecipe,
      cms.cooking.tabRecipeTailored,
      cms.cooking.toppingTitle,
      cms.cooking.fillingTitle,
      recipe.style,
      forcedTab,
    ],
  );
  const [tabView, setTabView] = useState<PagerTabId>("ricetta");
  const [pagerDir, setPagerDir] = useState(1);
  const activeTabView = forcedTab ?? tabView;
  const previousActiveTab = React.useRef<PagerTabId>(activeTabView);
  React.useEffect(() => {
    if (previousActiveTab.current === activeTabView) return;
    const order: PagerTabId[] = ["ricetta", "procedimento", "condimento"];
    setPagerDir(
      order.indexOf(activeTabView) > order.indexOf(previousActiveTab.current)
        ? 1
        : -1,
    );
    previousActiveTab.current = activeTabView;
  }, [activeTabView]);
  const switchTab = React.useCallback(
    (t: PagerTabId) => {
      if (forcedTab) return;
      const order: PagerTabId[] = ["ricetta", "procedimento", "condimento"];
      setPagerDir(order.indexOf(t) >= order.indexOf(activeTabView) ? 1 : -1);
      if (onTabChange) {
        onTabChange(t);
      } else {
        setTabView(t);
      }
    },
    [activeTabView, forcedTab, onTabChange],
  );
  /* Swipe: trascina il pannello per cambiare sezione */
  const onPanelDragEnd = React.useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      if (forcedTab) return;
      const ids = pagerTabs.map((t) => t.id);
      const i = ids.indexOf(activeTabView);
      if ((info.offset.x < -70 || info.velocity.x < -500) && i < ids.length - 1) {
        switchTab(ids[i + 1]);
      } else if ((info.offset.x > 70 || info.velocity.x > 500) && i > 0) {
        switchTab(ids[i - 1]);
      }
    },
    [activeTabView, forcedTab, pagerTabs, switchTab],
  );

  /* Piano comfort: calcolato in base alla timeline e start time */
  const [comfortToggled, setComfortToggled] = React.useState(false);
  const preComfortStart = React.useRef<Date | null>(null);
  const currentComfortPlan = React.useMemo(
    () => optimizeComfort(recipe.timeline, startTime, recipe.fermentation_temp_c),
    [recipe.timeline, startTime, recipe.fermentation_temp_c],
  );

  React.useEffect(() => {
    if (comfortToggled && currentComfortPlan) {
      const newStartMs = currentComfortPlan.newStart.getTime();
      if (startTime.getTime() !== newStartMs) {
        if (!preComfortStart.current) {
          preComfortStart.current = new Date(startTime);
        }
        setStretch(currentComfortPlan.stretch);
        setStartTime(currentComfortPlan.newStart);
      }
    }
  }, [comfortToggled, currentComfortPlan, startTime]);

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (hidePager) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const element = document.getElementById("recipe-content-tabs-anchor");
      if (element) {
        const isMobile = window.innerWidth < 768;
        const hasStickyHeader = document.querySelector(".sticky.top-0") !== null;
        const yOffset = isMobile 
          ? (hasStickyHeader ? -64 : -20)
          : -100;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTabView, hidePager]);

  /* ── Pizzata attiva: step localizzati + temporizzati per la sessione ── */
  const { session, startSession, openOverlay } = useCookSession();
  const hasActiveSession = !!session;
  const isThisSession = hasActiveSession && session?.styleId === recipe.style.id;
  const conflictingSession =
    hasActiveSession && session?.styleId !== recipe.style.id;
  const cookingSteps: Omit<CookSessionStep, "done">[] = React.useMemo(
    () =>
      recipe.timeline.map((step, i) => {
        const loc = localizeStep(step, recipe, cms, fmt);
        return {
          id: step.id,
          title: loc.title,
          description: loc.description,
          longDesc: loc.longDesc,
          tip: loc.tip ? (isNerd ? loc.tip.nerd : loc.tip.beginner) : undefined,
          duration_minutes: step.duration_minutes,
          startMs: (stepTimes[i]?.start ?? startTime).getTime(),
          endMs: (stepTimes[i]?.end ?? startTime).getTime(),
          flexible: FLEXIBLE_STEP_IDS.has(step.id),
        };
      }),
    [recipe, cms, isNerd, stepTimes, startTime],
  );

  /* Un solo punto di verità per "inizia/riprendi pizzata":
     - stessa ricetta già in corso → riapri la modalità cucina
     - altra ricetta in corso → chiedi conferma (sovrascrive)
     - nessuna sessione → parti subito */
  const handleStartCooking = React.useCallback(() => {
    if (isThisSession) {
      openOverlay();
    } else if (!isPersonalized) {
      setConfirmPersonalize(true);
    } else if (conflictingSession) {
      setConfirmReplace(true);
    } else {
      startSession(recipe.style.id, recipe.style.name, cookingSteps);
    }
  }, [isThisSession, isPersonalized, conflictingSession, openOverlay, startSession, recipe.style.id, recipe.style.name, cookingSteps]);

  React.useEffect(() => {
    const handler = () => handleStartCooking();
    window.addEventListener("vulcan:start-cooking", handler);
    return () => window.removeEventListener("vulcan:start-cooking", handler);
  }, [handleStartCooking]);

  const confirmStartCooking = React.useCallback(() => {
    setConfirmReplace(false);
    setConfirmPersonalize(false);
    startSession(recipe.style.id, recipe.style.name, cookingSteps);
  }, [startSession, recipe.style.id, recipe.style.name, cookingSteps]);

  const handlePersonalizeBeforeCooking = React.useCallback(() => {
    setConfirmPersonalize(false);
    onRequestPersonalization?.();
  }, [onRequestPersonalization]);

  const endTime =
    stepTimes.length > 0
      ? stepTimes[stepTimes.length - 1].end
      : startTime;
  const hasFlexiblePhases = React.useMemo(
    () => recipe.timeline.some((s) => FLEXIBLE_STEP_IDS.has(s.id)),
    [recipe.timeline],
  );

  /* Total duration in minutes for back-calculating start from end (stretch incluso) */
  const totalDurationMin = React.useMemo(
    () =>
      recipe.timeline.reduce(
        (sum, s, i) => sum + s.duration_minutes + (stretch[i] ?? 0),
        0,
      ),
    [recipe.timeline, stretch],
  );

  const mealSlots = React.useMemo(() => {
    const slots = generateTimeSlots(new Date());
    const totalDurationMs = totalDurationMin * 60_000;
    const nowMs = Date.now();
    return slots.map(slot => {
      const mealTimeMs = nowMs + slot.hours * 3600_000;
      const idealStartMs = mealTimeMs - totalDurationMs;
      const isFeasible = idealStartMs >= nowMs;
      return {
        ...slot,
        idealStart: new Date(idealStartMs),
        isFeasible,
      };
    });
  }, [totalDurationMin]);


  function handleTimeInput(
    e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>,
  ) {
    const value = e.target.value;
    if (!value) return;
    const d = value.includes("T") ? new Date(value) : (() => {
      const [h, m] = value.split(":").map(Number);
      const next = new Date(startTime);
      if (!isNaN(h) && !isNaN(m)) next.setHours(h, m, 0, 0);
      return next;
    })();
    if (!isNaN(d.getTime())) setStartTime(roundToQuarter(d));
    if (e.type === "blur") setEditingTime(false);
  }

  function handleEndTimeInput(
    e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>,
  ) {
    const value = e.target.value;
    if (!value) return;
    const desired = value.includes("T") ? new Date(value) : (() => {
      const [h, m] = value.split(":").map(Number);
      const next = new Date(startTime);
      if (!isNaN(h) && !isNaN(m)) next.setHours(h, m, 0, 0);
      return next;
    })();
    if (!isNaN(desired.getTime())) {
      // If desired end is before or equal to start, assume next day
      if (desired.getTime() <= startTime.getTime()) {
        desired.setDate(desired.getDate() + 1);
      }
      // Back-calculate start from desired end
      let newStart = addMinutes(desired, -totalDurationMin);
      // Non si può iniziare nel passato: sposta la fine avanti di giorni
      // finché l'inizio non è ≥ adesso (bug audit giugno 2026).
      while (newStart.getTime() < Date.now()) {
        desired.setDate(desired.getDate() + 1);
        newStart = addMinutes(desired, -totalDurationMin);
      }
      // Inizio sempre su un quarto d'ora: "parti alle 07:37" è precisione finta.
      setStartTime(roundToQuarter(newStart));
    }
    if (e.type === "blur") setEditingEndTime(false);
  }

  const updateBalls = (n: number) => {
    onConstraintsChange({
      ...constraints,
      dough_balls: Math.max(1, Math.min(20, n)),
    });
  };

  /* VPL-013: Compensations applied */
  const compensations = recipe.science?.compensations ?? [];


  return (
    <div className="recipe-output">
      {/* Sticky header portal actions */}
      {portalTarget && createPortal(
        <>
          {/* Share button (Copia link) in the header */}
          {shareUrl && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyLink}
              className={`recipe-output-share-btn type-data${linkCopied ? " recipe-output-share-btn--copied" : ""}`}
              title={linkCopied ? cms.ui.copied : cms.ui.share}
              aria-label={cms.pages.recipeCopyLinkAria}
            >
              {linkCopied ? <Check size={14} /> : <LinkIcon size={14} />}
              <span data-slot="label">{linkCopied ? cms.ui.copied : cms.ui.share}</span>
            </motion.button>
          )}
        </>,
        portalTarget
      )}



      {/* ── Conferma: nuova pizzata sovrascrive quella in corso ── */}
      <ConfirmDialog
        open={confirmReplace}
        onDismiss={() => setConfirmReplace(false)}
        ariaLabel={cms.cooking.confirmNewAria}
        icon={<Flame size={26} />}
        title={cms.cooking.replaceTitle}
        body={t(cms.cooking.replaceBody, {
          current: session?.styleName ?? "",
          next: recipe.style.name,
        })}
        actions={[
          {
            label: (
              <>
                <Flame size={16} />
                {t(cms.cooking.replaceStart, { style: recipe.style.name })}
              </>
            ),
            onClick: confirmStartCooking,
            variant: "cta",
          },
          {
            label: t(cms.cooking.replaceResume, { style: session?.styleName ?? "" }),
            onClick: () => {
              setConfirmReplace(false);
              openOverlay();
            },
            variant: "secondary",
          },
        ]}
      />

      {/* ── Promemoria: la ricetta canonica non è ancora adattata ── */}
      <ConfirmDialog
        open={confirmPersonalize}
        onDismiss={() => setConfirmPersonalize(false)}
        ariaLabel={cms.cooking.notPersonalizedAria}
        icon={<Flame size={26} />}
        emphasis="brand"
        size="md"
        title={cms.cooking.preCookTitle}
        body={cms.cooking.preCookBody}
        actions={[
          ...(onRequestPersonalization
            ? [
                {
                  label: cms.cooking.preCookAdapt,
                  onClick: handlePersonalizeBeforeCooking,
                  variant: "primary" as const,
                },
              ]
            : []),
          {
            label: cms.cooking.preCookStart,
            onClick: confirmStartCooking,
            variant: "secondary" as const,
          },
        ]}
      />

      {/* ── Contesto: questa ricetta è SU MISURA, non quella canonica ──
          (feedback giugno 2026: "non è chiaro che parametri e punteggio si
          riferiscono alla ricetta adattata alle tue possibilità") */}
      {!hideContextSummary && (
        <div className="recipe-output-context type-body">
          <span className="recipe-output-context__pill">
            {isPersonalized ? cms.cooking.recipeAdapted : cms.cooking.recipeCanonical}
          </span>
          <span className="recipe-output-context__summary">
            {t(cms.cooking.ovenSummary, { temp: fmt.celsius(constraints.oven_max_temp_c) })} · {recipe.dough_balls}{" "}
            {getServingUnitLabel(cms, servingUnit, recipe.dough_balls, true)}
            {" · "}
            <time dateTime={endTime.toISOString()}>
              {t(cms.cooking.readyAt, {
                eta: `${hasFlexiblePhases ? "~" : ""}${endTime.toLocaleTimeString(bcp47, { hour: "2-digit", minute: "2-digit" })}`,
              })}
            </time>
          </span>
        </div>
      )}

      {/* ═══ PAGER ORIZZONTALE (feedback giugno 2026) ═══
          Meno info per schermata, navigazione da app: Ricetta | Procedimento.
          Il layer PizzaNerd trasforma i contenuti inline, senza tab separata. */}
      {!hidePager && (
      <div className="recipe-output-pager">
        {/* Button group espressivo: a tutta larghezza, segmento attivo con
            forma piena che "scivola" a molla tra le posizioni. */}
        <div
          className="recipe-output-pager__tabs"
          role="tablist"
          aria-label={cms.cooking.sectionsAria}
        >
          {pagerTabs.map((t) => {
            const active = activeTabView === t.id;
            const TabIcon = t.icon;
            return (
              <motion.button
                key={t.id}
                onClick={() => switchTab(t.id)}
                role="tab"
                aria-selected={active}
                whileTap={{ scale: 0.95 }}
                className={`recipe-output-pager__tab type-data-field${active ? " recipe-output-pager__tab--active" : ""}`}
              >
                {active && (
                  <motion.span
                    layoutId="recipe-pager-pill"
                    className="recipe-output-pager__tab-pill"
                    transition={motionSpring.selection}
                  />
                )}
                <TabIcon size={15} />
                {t.label}
              </motion.button>
            );
          })}
        </div>
        {shareUrl && (
          <IconButton
            as={motion.button}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyLink}
            size="lg"
            variant="ghost"
            className={`recipe-output-pager__share${linkCopied ? " recipe-output-pager__share--copied" : ""}`}
            title={linkCopied ? cms.ui.copied : cms.ui.share}
            aria-label={cms.pages.recipeCopyLinkAria}
          >
            {linkCopied ? <Check size={16} /> : <Share2 size={15} />}
          </IconButton>
        )}
      </div>
      )}

      <AnimatePresence initial={false} custom={{ direction: pagerDir, reduceMotion }} mode="wait">
      {activeTabView === "ricetta" && (
      <motion.div
        key="panel-ricetta"
        custom={{ direction: pagerDir, reduceMotion }}
        variants={panelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={motionSpring.panel}
        drag={forcedTab ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onPanelDragEnd}
        className="recipe-output-panel recipe-output-panel--ricetta"
      >
      <ScrollToTopOnMount />
      {/* Parametri + match + Regola a mano sono UN blocco compatto (mockup
          Proposta A) e vivono PRIMA degli ingredienti: i parametri sono
          l'identità della ricetta, gli ingredienti la conseguenza. */}
      <div className="recipe-output-params">
        {matchSlot}
        {recipeControls}
      </div>

      <div className="recipe-output-ingredients" data-slot="recipe-main">
        <IngredientsSection
          recipe={recipe}
          constraints={constraints}
          simple={simple}
          isNerd={isNerd}
          servingUnit={servingUnit}
          panSizeLabel={panSizeLabel}
          updateBalls={updateBalls}
          showRule55Tip={showRule55Tip}
          setShowRule55Tip={setShowRule55Tip}
          rule55Description={rule55Description}
        />
      </div>

      </motion.div>
      )}

      {activeTabView === "procedimento" && (
      <motion.div
        key="panel-procedimento"
        custom={{ direction: pagerDir, reduceMotion }}
        variants={panelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={motionSpring.panel}
        drag={forcedTab ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onPanelDragEnd}
        className="recipe-output-panel recipe-output-panel--procedura"
      >
      <ScrollToTopOnMount />
      <div className="recipe-output-hero-wrap">
        <ProcedureHeroControls
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          totalDurationMin={totalDurationMin}
          hasFlexiblePhases={hasFlexiblePhases}
          editingTime={editingTime}
          setEditingTime={setEditingTime}
          editingEndTime={editingEndTime}
          setEditingEndTime={setEditingEndTime}
          handleTimeInput={handleTimeInput}
          handleEndTimeInput={handleEndTimeInput}
          mealSlots={mealSlots}
          comfortToggled={comfortToggled}
          setComfortToggled={setComfortToggled}
          currentComfortPlan={currentComfortPlan}
          preComfortStart={preComfortStart}
          setStretch={setStretch}
        />
      </div>

      <ProcedureTimeline
        recipe={recipe}
        isNerd={isNerd}
        compensations={compensations}
        startTime={startTime}
        stepTimes={stepTimes}
        stretch={stretch}
        effDuration={effDuration}
        servingUnit={servingUnit}
        activeTopping={activeTopping}
        toppingChoices={toppingChoices}
        allToppingChoices={allToppingChoices}
        onSelectTopping={onSelectTopping}
      />

      </motion.div>
      )}

      {activeTabView === "condimento" && (
      <motion.div
        key="panel-condimento"
        custom={{ direction: pagerDir, reduceMotion }}
        variants={panelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={motionSpring.panel}
        drag={forcedTab ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onPanelDragEnd}
        className="recipe-output-panel recipe-output-panel--condimento"
      >
      <ScrollToTopOnMount />
      <ToppingSection mode="ingredients" recipe={recipe} activeTopping={activeTopping} toppingChoices={toppingChoices} allToppingChoices={allToppingChoices} servingUnit={servingUnit} onSelectTopping={onSelectTopping} />
      </motion.div>
      )}

      </AnimatePresence>

      {/* ── Feedback form — solo nel tab Ricetta: ripetuto in tutti e tre i
          tab era rumore (audit fruibilità luglio 2026). ── */}
      {showFeedback && activeTabView === "ricetta" && (
        <div className="recipe-output-feedback-wrap">
          <RecipeFeedbackForm recipe={recipe} skillLevel={constraints.skill_level} />
        </div>
      )}

    </div>
  );
}
