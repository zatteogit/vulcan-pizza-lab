import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Clock, CookingPot, Droplets, Flame, ScanLine, Wheat } from "lucide-react";
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
export function CompatibilityPill({ now, original, blocked, labelled = false, className, context = "card" }: { now: number; original?: number; blocked?: boolean; labelled?: boolean; className?: string; context?: "card" | "detail" }) {
  const { cms } = useCms();
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
  const label = original === undefined ? `${cms.ui.scoreBasisOriginal} · ${uiMessage("pages.explore.compatibility", [now])}`
    : `${cms.ui.scoreBasisOriginal} ${original} → ${cms.ui.scoreBasisTailored} ${now}`;
  return (
    <>
    <button ref={trigger} type="button" className={`compat-pill${blocked ? " compat-pill--blocked" : ""}${className ? ` ${className}` : ""}`} aria-label={label} aria-expanded={open} aria-describedby={open ? id : undefined}
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}
      onClick={event => { event.preventDefault(); event.stopPropagation(); cancelClose(); pinned.current = !pinned.current; setOpen(pinned.current); }}>
      {original !== undefined && <>
        <span className="compat-pill__original">{original}</span>
        <span className="compat-pill__arrow" aria-hidden="true">→</span>
        {labelled && <span className="compat-pill__label">{cms.ui.scoreBasisTailored}</span>}
      </>}
      <RecipeMatchIcon score={now} blocked={blocked} size={14} aria-hidden="true" className="compat-pill__icon" />
      <span className="compat-pill__now">{now}</span>
    </button>
    {open && createPortal(<div ref={tip} id={id} role="tooltip" className="score-tip" onMouseEnter={cancelClose} onMouseLeave={hide}
      style={{"--score-tip-left":`${position.left}px`,"--score-tip-top":`${position.top}px`,"--score-tip-width":`${position.width}px`} as CSSProperties}>
      <p className="score-tip__title">{cms.ui.scoreTipTitle}</p>
      <div className="score-tip__row"><span className="score-tip__label">{cms.ui.scoreBasisOriginal}</span><strong>{original ?? now}/100</strong></div>
      <p className="score-tip__description">{cms.ui.scoreTipOriginal}</p>
      {original !== undefined && <><div className="score-tip__row"><span className="score-tip__label">{cms.ui.scoreBasisTailored}</span><strong>{now}/100</strong></div><p className="score-tip__description">{cms.ui.scoreTipTailored}</p></>}
      <p className="score-tip__note">{blocked && context === "card" ? cms.ui.scoreTipBlocked : cms.ui.scoreTipGlobal}</p>
    </div>, document.body)}
    </>
  );
}

/** A maximum of two useful signals, inside the photo. The duration describes
 * the complete generated timeline, not fermentation alone. */
export function StyleMetaChip({ style, cms, recipe, context = "create" }: { style: PizzaStyle; cms: CmsContent; recipe?: GeneratedRecipe; context?: "create" | "explore" }) {
  const { bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const signals = recipe ? recipeCardSignals(recipe, context) : [];
  const icons = { oven: Flame, time: Clock, pan: CookingPot, flour: Wheat, check: ScanLine, water: Droplets }; /* FW-13: Flame solo per il forno */
  const duration = recipe
    ? fmt.durationShort(Math.round(recipe.timeline.reduce((sum, step) => sum + step.duration_minutes, 0) / 30) / 2)
    : `${style.dough.fermentation_hours_range[0]}–${style.dough.fermentation_hours_range[1]}h`;
  return (
    <div className="style-signals" data-region="meta">
      {signals.map(signal => {
        const Icon = icons[signal.icon];
        const text = engineMsgTexts([signal.message], cms, bcp47)[0];
        return <Badge key={text} tone={signal.tone} className={signal.tone === "error" ? "style-signal style-signal--error" : "style-signal style-signal--warning"}>
          <Icon size={13} aria-hidden="true" /><span data-slot="label">{text}</span>
        </Badge>;
      })}
      {signals.length < 2 && recipe?.verdict.outcome !== "not_feasible" && (
        <Badge tone="muted" className="style-signal"><Clock size={13} aria-hidden="true" /><span data-slot="label">≈ {duration}</span></Badge>
      )}
    </div>
  );
}
