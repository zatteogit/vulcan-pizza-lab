import { useCms } from "../cms/cms-context";
import { formatRange } from "../../i18n/format";
import { createFormatter, t } from "../cms/i18n";
import { ScoreExplainer, scoreAriaLabel } from "./score-explainer";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Clock, Droplets, Flame, ScanLine, Wheat } from "lucide-react";
import { Badge } from "../../components/ds/index";
import { RecipeMatchIcon } from "./recipe-match-icon";
import { recipeCardSignals } from "./recipe-card-signals";
import { engineMsgTexts } from "./engine-msg-text";
import type { GeneratedRecipe, PizzaStyle } from "../../domain/pizza-engine";
import type { CmsContent } from "../cms/cms-context";
import { uiMessage } from "../../i18n/ui-messages";


/* ═══ Parti comuni delle card di uno stile (Scopri e Crea) ═══
 * Nota di Matteo (24/10/2026): le card delle due pagine erano due componenti
 * diversi (anello del punteggio contro pill, «Principianti» in alto contro
 * «livello · ore» in basso). Un solo linguaggio: in alto a destra la
 * compatibilità con la tua cucina, in basso solo segnali utili alla scelta. */

/** The original is heart + score. A tailored proposal shows its actual
 * starting score, then the resulting score, even when the two are equal. */
/** FW-03 (S03-A-12): `context="detail"` when the pill already sits in the
 * detail sheet, so the tip never asks to «open the detail» the user is in. */
/** FW-06: `recipe` è la ricetta di cui `now` è il punteggio: il suggerimento la spiega (ScoreExplainer). */
export function CompatibilityPill({ now, original, blocked, labelled = false, className, context = "card", recipe }: { now: number; original?: number; blocked?: boolean; labelled?: boolean; className?: string; context?: "card" | "detail"; recipe?: GeneratedRecipe }) {
  const { cms, bcp47 } = useCms();
  const [open, setOpen] = useState(false);
  const pinned = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const id = useId();
  const [position, setPosition] = useState({ left: 0, top: 0, width: 320 });
  const cancelClose = () => clearTimeout(closeTimer.current);
  const show = () => { cancelClose(); setOpen(true); };
  const hide = () => {
    cancelClose();
    if (!pinned.current) closeTimer.current = setTimeout(() => setOpen(false), 160);
  };
  const close = () => { cancelClose(); pinned.current = false; setOpen(false); };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const place = useCallback(() => {
    if (!trigger.current || !tip.current) return;
    const rect = trigger.current.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 32);
    const height = tip.current.getBoundingClientRect().height;
    setPosition({ width,
      left: Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16)),
      top: rect.bottom + height + 24 <= window.innerHeight ? rect.bottom + 8 : Math.max(16, rect.top - height - 8),
    });
  }, []);
  useLayoutEffect(() => { if (open) place(); }, [open, now, original, position.width, place]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !tip.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.stopPropagation(); event.preventDefault(); close(); }
    };
    const scroll = (event: Event) => {
      if (tip.current?.contains(event.target as Node)) return;
      if (document.activeElement === trigger.current && !pinned.current) place();
      else close();
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", escape, true);
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("keydown", escape, true);
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open, place]);
  /* FW-06 (S03-A-11, S05-A-12, S05-B-04, S07-A-15): un numero con il suo
     nome. La coppia Riferimento · Su misura solo se i due valori differiscono
     e lo stile non è bloccato («39 → 39» era rumore); sulle card solo per un
     miglioramento vero (≥ 5 punti), mai una freccia verso un valore più basso. */
  const fmt = createFormatter(cms.ui, bcp47);
  const differs = original !== undefined && !blocked && original !== now;
  const improves = differs && now - (original ?? now) >= 5;
  const showPair = labelled ? differs : improves;
  const pairText = original !== undefined ? t(cms.scoreExplainer.pairAria, {
    original: cms.ui.scoreBasisOriginal, originalScore: fmt.number(original),
    tailored: cms.ui.scoreBasisTailored, tailoredScore: fmt.number(now),
  }) : "";
  const score = differs ? `${scoreAriaLabel(now, cms, fmt)}. ${pairText}` : scoreAriaLabel(now, cms, fmt);
  /* Lo stato bloccato non si affida al solo colore: lo dice anche il nome. */
  const label = blocked ? `${uiMessage("pages.explore.compatibilityBlocked")} · ${score}` : score;
  return (
    <>
    <button ref={trigger} type="button" className={`compat-pill${blocked ? " compat-pill--blocked" : ""}${className ? ` ${className}` : ""}`} aria-label={label} aria-expanded={open} aria-describedby={open ? id : undefined}
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}
      onClick={event => { event.preventDefault(); event.stopPropagation(); cancelClose(); pinned.current = !pinned.current; setOpen(pinned.current); }}>
      {showPair && original !== undefined && (labelled ? <>
        <span className="compat-pill__label">{cms.ui.scoreBasisOriginal}</span>
        <span className="compat-pill__original">{fmt.number(original)}</span>
        <span className="compat-pill__arrow" aria-hidden="true">·</span>
        <span className="compat-pill__label">{cms.ui.scoreBasisTailored}</span>
      </> : <>
        <span className="compat-pill__original">{fmt.number(original)}</span>
        <span className="compat-pill__arrow" aria-hidden="true">→</span>
      </>)}
      <RecipeMatchIcon score={now} blocked={blocked} size={14} aria-hidden="true" className="compat-pill__icon" />
      <span className="compat-pill__now">{fmt.number(now)}</span>
    </button>
    {open && createPortal(<div ref={tip} id={id} role="tooltip" className="score-tip" onMouseEnter={cancelClose} onMouseLeave={hide}
      style={{"--score-tip-left":`${position.left}px`,"--score-tip-top":`${position.top}px`,"--score-tip-width":`${position.width}px`} as CSSProperties}>
      <p className="score-tip__title">{cms.ui.recipeScore}</p>
      {differs && original !== undefined ? <>
        <p className="score-tip__row"><span className="score-tip__label">{cms.ui.scoreBasisOriginal}</span><strong>{fmt.number(original)}/100</strong></p>
        <p className="score-tip__description">{cms.ui.scoreTipOriginal}</p>
        <p className="score-tip__row"><span className="score-tip__label">{cms.ui.scoreBasisTailored}</span><strong>{fmt.number(now)}/100</strong></p>
        <p className="score-tip__description">{now < original ? cms.scoreExplainer.tailoredLower : cms.ui.scoreTipTailored}</p>
      </> : (
        <p className="score-tip__row"><span className="score-tip__label">{original !== undefined ? cms.ui.scoreBasisTailored : cms.ui.scoreBasisOriginal}</span><strong>{fmt.number(now)}/100</strong></p>
      )}
      {recipe ? <ScoreExplainer scores={recipe.scores} recipe={recipe} variant="compact" />
        : <p className="score-tip__note">{blocked && context === "card" ? cms.ui.scoreTipBlocked : cms.ui.scoreTipGlobal}</p>}
    </div>, document.body)}
    </>
  );
}

/** A maximum of two useful signals, inside the photo. The duration describes
 * the complete generated timeline, not fermentation alone. */
export function StyleMetaChip({ style, cms, recipe, context = "create", id }: { style: PizzaStyle; cms: CmsContent; recipe?: GeneratedRecipe; context?: "create" | "explore"; /** Per aria-describedby del link che contiene i segnali. */ id?: string }) {
  const { bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const signals = recipe ? recipeCardSignals(recipe, context) : [];
  /* Fiamma per il forno e per la teglia (nota di Matteo, 29/10/2026: la teglia
     è un requisito di cottura, come pietra o acciaio). */
  const icons = { oven: Flame, time: Clock, pan: Flame, flour: Wheat, check: ScanLine, water: Droplets };
  // Pill su una riga: è una durata approssimata («≈»), quindi dalle 10 ore
  // in su all'ora intera («≈ 22 h in tutto»), sotto alla mezz'ora.
  const totalHours = recipe ? recipe.timeline.reduce((sum, step) => sum + step.duration_minutes, 0) / 60 : 0;
  const duration = recipe
    ? fmt.durationShort(totalHours >= 10 ? Math.round(totalHours) : Math.round(totalHours * 2) / 2)
    : formatRange(style.dough.fermentation_hours_range[0], style.dough.fermentation_hours_range[1], bcp47, { unit: "hour" });
  return (
    <div id={id} className="style-signals" data-region="meta">
      {signals.map(signal => {
        const Icon = icons[signal.icon];
        const text = engineMsgTexts([signal.message], cms, bcp47)[0];
        return <Badge key={text} tone={signal.tone} className={signal.tone === "error" ? "style-signal style-signal--error" : "style-signal style-signal--warning"}>
          <Icon size={13} aria-hidden="true" /><span data-slot="label">{text}</span>
        </Badge>;
      })}
      {signals.length < 2 && recipe?.verdict.outcome !== "not_feasible" && (
        /* FW-05 (S03-B-21, S03-A-21): il badge dice che cosa misura (il tempo
           totale) e, a voce, su quale ricetta: riferimento in Scopri, su misura in Crea. */
        <Badge
          tone="muted"
          className="style-signal"
          aria-label={recipe
            ? uiMessage(context === "explore" ? "style.meta.durationAriaReference" : "style.meta.durationAriaTailored", [duration])
            : undefined}
        >
          <Clock size={13} aria-hidden="true" />
          <span data-slot="label">
            {recipe ? uiMessage("style.meta.durationTotal", [duration]) : uiMessage("style.meta.durationFermentation", [duration])}
          </span>
        </Badge>
      )}
    </div>
  );
}
