/**
 * SearchButton — bottone circolare "apri ricerca" condiviso dai dock.
 *
 * Standardizza icona (proporzionale al diametro), strokeWidth, aria-label
 * (CMS + ⌘K) e micro-interazione, così il bottone di ricerca è coerente su
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

export function SearchButton({
  size = "md",
  className,
  onOpen,
}: {
  size?: keyof typeof SEARCH_BUTTON_SIZE;
  className?: string;
  onOpen?: () => void;
}) {
  const { cms } = useCms();
  const prefersReducedMotion = useReducedMotion();
  const sizing = SEARCH_BUTTON_SIZE[size];

  return (
    <motion.button
      type="button"
      onClick={() => onOpen?.()}
      className={`search-button ${sizing.className}${className ? ` ${className}` : ""}`}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
      transition={motionSpring.standard}
      aria-label={uiMessage("components.shared.search-button.value-k-b834ead1", [cms.pages.navSearch])}
      title={uiMessage("components.shared.search-button.k-64d86f33")}
    >
      <Search size={sizing.icon} strokeWidth={2} />
    </motion.button>
  );
}
