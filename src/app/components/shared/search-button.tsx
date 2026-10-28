/**
 * SearchButton — bottone circolare "apri ricerca" condiviso dai dock.
 *
 * Standardizza icona (proporzionale al diametro), strokeWidth, aria-label
 * (CMS; la scorciatoia in aria-keyshortcuts e nel tooltip) e micro-interazione, così il bottone di ricerca è coerente su
 * tutte le superfici. Dimensione e superficie restano prop (il dock mobile, la
 * rail desktop e la navbar ricette hanno diametri/sfondi legittimamente diversi).
 *
 * Pattern (T5), non T4: dipende dal CMS, quindi vive fuori da `ds/` (context-free).
 */
import { Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCms } from "../../features/cms/cms-context";
import { motionSpring } from "../ds/motion";
import { uiMessage } from "../../i18n/ui-messages";

const SEARCH_BUTTON_SIZE = {
  sm: { className: "search-button--sm", icon: 20 },
  md: { className: "search-button--md", icon: 20 },
  lg: { className: "search-button--lg", icon: 24 },
} as const;

/* FW-12 (S01-A-09/B-12): la scorciatoia sta nel tooltip solo dove si usa una
   tastiera (puntatore fine), con il tasto giusto per la piattaforma, e fuori
   dal nome accessibile (lo dice aria-keyshortcuts). */
function shortcutHint(): string | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;
  if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return null;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    "";
  return /mac|iphone|ipad/i.test(platform)
    ? uiMessage("components.shared.search-button.k-64d86f33")
    : uiMessage("components.shared.search-button.shortcut-ctrl");
}

export function SearchButton({
  size = "md",
  className,
  onOpen,
  active = false,
}: {
  size?: keyof typeof SEARCH_BUTTON_SIZE;
  className?: string;
  onOpen?: () => void;
  /** FW-12 (S04-B-18): ricerca aperta. */
  active?: boolean;
}) {
  const { cms } = useCms();
  const prefersReducedMotion = useReducedMotion();
  const sizing = SEARCH_BUTTON_SIZE[size];
  const shortcut = shortcutHint();

  return (
    <motion.button
      type="button"
      onClick={() => onOpen?.()}
      className={`search-button ${sizing.className}${className ? ` ${className}` : ""}`}
      data-active={active || undefined}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
      transition={motionSpring.standard}
      aria-label={cms.pages.navSearch}
      aria-keyshortcuts="Meta+K Control+K"
      title={shortcut
        ? uiMessage("components.shared.search-button.title", [cms.pages.navSearch, shortcut])
        : cms.pages.navSearch}
    >
      <Search size={sizing.icon} strokeWidth={2} aria-hidden="true" />
    </motion.button>
  );
}
