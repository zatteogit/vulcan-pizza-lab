/* === APP SHELL — VPL-055 / VPL-072 ===
   Layout principale con Tab Bar Material 3.
   Mobile: bottom bar 4 tab + search FAB.
   Desktop: sidebar rail + search icon.
   ⌘K / Ctrl+K apre la ricerca a tutta pagina (U-5). */

import {
Compass,
Flame,
GraduationCap,
User,
} from "lucide-react";
import { AnimatePresence,motion,useReducedMotion } from "motion/react";
import { Suspense,lazy,useCallback,useEffect,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type MutableRefObject,type RefObject } from "react";
import { Link,Outlet,useLocation,useNavigate } from "react-router";
import { ActiveCookWidget } from "../../features/cooking/active-cook-widget";
import { CmsProvider,useCms } from "../../features/cms/cms-context";
import { CookSessionProvider,useCookSession } from "../../features/cooking/cook-session";
import type { DarkModeContext,ThemeMode } from "../../hooks/use-dark-mode";
import { SearchButton } from "./search-button";
import { PageSearchBar, SearchField } from "./search-field";
import { useIsMobile } from "../../hooks/use-mobile";
import { RouteTitle, SkipLink } from "./route-title";

/* Audit bundle lug 2026: CookingMode e la ricerca trascinavano motore,
   topping, glossario e troubleshooting nel chunk d'ingresso (~400 kB di
   sorgente) pur montandosi solo su richiesta → lazy. */
const CookingMode = lazy(() =>
  import("../../features/cooking/cooking-mode").then((m) => ({
    default: m.CookingMode,
  })),
);
const SearchResultsView = lazy(() =>
  import("../../features/search/search-results-view").then((m) => ({ default: m.SearchResultsView })),
);
import { DebugOverlay } from "../../features/dev-tools/debug-overlay";
import { ThemeSwitcher } from "../../features/dev-tools/theme-switcher";
import { StylesOverrideProvider } from "../../context/styles-override-context";
import { VulcanMark } from "./vulcan-logo";
import { VulcanHero } from "./vulcan-hero";
import { BRAND } from "../../config/brand";
import { motionDuration,motionEase,motionSpring } from "../ds/motion";
import { uiMessage } from "../../i18n/ui-messages";
import { TOOLS_ENABLED } from "../../config/tools";

const MotionLink = motion(Link);

/* ═══ DARK MODE — tri-state: light / dark / auto ═══ */
const DARK_MODE_KEY = "vulcan_dark_mode";
const DEV_MODE_KEY = "vulcan_dev_mode";

function loadThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(DARK_MODE_KEY);
    if (raw === "auto" || raw === "light" || raw === "dark") return raw;
    /* Legacy migration: "true" → "dark", "false" → "light" */
    if (raw === "true") return "dark";
    if (raw === "false") return "light";
  } catch {
    /* iframe / storage restricted */
  }
  return "auto";
}

function saveThemeMode(value: ThemeMode) {
  try {
    localStorage.setItem(DARK_MODE_KEY, value);
  } catch {
    /* iframe / storage restricted */
  }
}

function resolveThemeMode(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  /* auto: follow system preference */
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

function loadDevMode(): boolean {
  if (!TOOLS_ENABLED) return false;
  try {
    const raw = localStorage.getItem(DEV_MODE_KEY);
    if (raw !== null) return raw === "true";
  } catch {
    /* iframe / storage restricted */
  }
  return false;
}

function saveDevMode(value: boolean) {
  try {
    localStorage.setItem(DEV_MODE_KEY, String(value));
  } catch {
    /* iframe / storage restricted */
  }
}

/* ═══ TAB DEFINITIONS ═══ */
interface TabDef {
  id: string;
  labelKey: string;
  labelFallback: string;
  icon: typeof Flame;
  path: string;
  /** Path prefixes that activate this tab */
  match: string[];
}

/* Audit Sprint 12 — Profilo NON è una tab pari ad altre: è impostazione utente.
   Spostato dalla tab bar all'header top-right (vedi ProfileButton in AppShell). */
const TABS: TabDef[] = [
  {
    id: "explore",
    labelKey: "navExplore",
    /* "Scopri", non "Stili": la sezione contiene ricette iconiche E stili
       (feedback giugno 2026). */
    get labelFallback() { return uiMessage("components.shared.app-shell.scopri-b4aad9f0"); },
    icon: Compass,
    path: "/explore",
    match: ["/explore"],
  },
  /* D-037: Crea è la seconda tab, su /crea. */
  { id: "create", labelKey: "navCreate", get labelFallback() { return uiMessage("components.shared.app-shell.crea-e7c107d0"); }, icon: Flame, path: "/crea", match: ["/crea"] },
  {
    id: "learn",
    labelKey: "navLearn",
    get labelFallback() { return uiMessage("components.shared.app-shell.impara-bc1df07a"); },
    icon: GraduationCap,
    path: "/learn",
    match: ["/learn"],
  },
];

/* Profile tab kept separate — render come pulsante top-right, non come tab. */
const PROFILE_TAB: TabDef = {
  id: "profile",
  labelKey: "navProfile",
  get labelFallback() { return uiMessage("components.shared.app-shell.profilo-afedc6c9"); },
  icon: User,
  path: "/profile",
  match: ["/profile"],
};

const navSpring = motionSpring.navigation;
const navQuickSpring = motionSpring.navigationQuick;

function getActiveTab(pathname: string): string | null {
  /* PROFILE_TAB checked too — usato per highlight pulsante top-right. */
  for (const tab of [...TABS, PROFILE_TAB]) {
    if (tab.match.some((m) => pathname === m || pathname.startsWith(m + "/")))
      return tab.id;
  }
  return null;
}

/* ═══ TAB ITEM ═══ */
function TabItem({
  tab,
  active,
  layout,
}: {
  tab: TabDef;
  active: boolean;
  layout: "bottom" | "rail";
}) {
  const Icon = tab.icon;
  /* Resolve label from CMS pages section */
  const { cms } = useCms();
  const prefersReducedMotion = useReducedMotion();
  const label = (cms.pages as any)?.[tab.labelKey] || tab.labelFallback;
  const isRailLayout = layout === "rail";

  return (
    <Link
      to={tab.path}
      className={isRailLayout ? "app-shell-tab app-shell-tab--rail" : "app-shell-tab app-shell-tab--bottom"}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator pill (M3 style) */}
      {/* tabIndex -1: whileTap su un div lo renderebbe un tab stop senza nome
          (audit n. 23); il focus resta sul link. */}
      <motion.div
        className="app-shell-tab__pill"
        tabIndex={-1}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.045 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
        transition={navQuickSpring}
      >
        {active && (
          <motion.div
            layoutId={`tab-indicator-${layout}`}
            className="app-shell-tab__indicator"
            transition={navSpring}
          />
        )}
        <Icon size={24} className="app-shell-tab__icon" />
      </motion.div>

      {/* Label */}
      <span className="type-data app-shell-tab__label">{label}</span>
    </Link>
  );
}

type LiquidNavState = {
  hidden: boolean;
  /** Fondo pagina raggiunto: il dock in basso si mostra, ma l'avatar in alto
   *  NON deve ricomparire sopra i contenuti (audit lug 2026). */
  nearBottom: boolean;
  scrolled: boolean;
};

const NAV_RESYNC_EVENT = "vulcan:nav-resync";

/* ═══ Barre dinamiche (feedback giugno 2026, stile liquid glass) ═══
   La chrome fluttua sopra al contenuto: si ritira quando leggi, riemerge
   appena risali e cambia densità quando c'è contenuto che scorre sotto. */
function useLiquidNavState(threshold = 28): LiquidNavState {
  const [state, setState] = useState<LiquidNavState>({
    hidden: false,
    scrolled: false,
    nearBottom: false,
  });
  useEffect(() => {
    let lastY = window.scrollY;
    let acc = 0;
    let frame = 0;

    /* Massimo scroll reale della pagina. Su Safari iOS lo scrollY va oltre
       questo valore (o sotto 0 in cima) durante il rubber-band: lo usiamo per
       clampare ed evitare che l'elastico generi un dy fantasma. */
    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const readScroll = () => {
      frame = 0;
      /* Clamp anti rubber-band iOS: senza questo, l'overscroll in cima/fondo
         produce delta spurii che fanno lampeggiare il dock. */
      const y = Math.min(Math.max(window.scrollY, 0), maxScroll());
      const dy = y - lastY;
      lastY = y;
      const isScrolled = y > 24;
      const nearBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 120;

      if (y < 96 || nearBottom) {
        setState((prev) => {
          const next = { hidden: false, scrolled: isScrolled, nearBottom };
          return prev.hidden === next.hidden &&
            prev.scrolled === next.scrolled &&
            prev.nearBottom === next.nearBottom
            ? prev
            : next;
        });
        acc = 0;
        return;
      }

      if (Math.abs(dy) < 0.5) return;
      acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy;

      setState((prev) => {
        const hide = y > 140 && acc > threshold;
        const show = acc < -threshold * 0.72;
        const hidden = hide ? true : show ? false : prev.hidden;
        const next = { hidden, scrolled: isScrolled, nearBottom };
        if (hidden !== prev.hidden) acc = 0;
        return prev.hidden === next.hidden &&
          prev.scrolled === next.scrolled &&
          prev.nearBottom === next.nearBottom
          ? prev
          : next;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(readScroll);
    };

    /* Comparsa/scomparsa della barra indirizzi Safari iOS: emette resize (e
       visualViewport resize) senza uno scroll reale dell'utente. La trattiamo
       come "mostra il dock" e ri-sincronizziamo lastY, così la barra che
       ricompare non lascia il dock nascosto né provoca un flip spurio. */
    /* U-5: un salto di scroll fatto dall'app (ritorno da «Annulla» della
       ricerca) non è lettura: si riallinea senza ritirare il dock. */
    const onResync = () => {
      lastY = Math.min(Math.max(window.scrollY, 0), maxScroll());
      acc = 0;
      setState((prev) => (prev.hidden ? { ...prev, hidden: false } : prev));
    };

    const onViewportChange = () => {
      lastY = Math.min(Math.max(window.scrollY, 0), maxScroll());
      acc = 0;
      setState((prev) => (prev.hidden ? { ...prev, hidden: false } : prev));
    };

    /* U-10 (F02): dock, avatar e widget di cottura si ritirano allo scroll ma
       restano nella sequenza del Tab. Quando il focus ci entra ricompaiono,
       così chi usa la tastiera non finisce su controlli invisibili. */
    const onFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest(".app-shell-dock, .app-shell-profile, .cook-widget")) return;
      acc = 0;
      setState((prev) =>
        prev.hidden || prev.nearBottom ? { ...prev, hidden: false, nearBottom: false } : prev,
      );
    };

    onScroll();
    window.addEventListener(NAV_RESYNC_EVENT, onResync);
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onViewportChange, { passive: true });
    window.visualViewport?.addEventListener("resize", onViewportChange);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener(NAV_RESYNC_EVENT, onResync);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
    };
  }, [threshold]);
  return state;
}

type DockSearch = {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onCancel: () => void;
  inputRef: RefObject<HTMLInputElement>;
  onKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
};

/* U-5: con la tastiera virtuale aperta il dock deve stare sopra di essa, non
   dietro. La distanza arriva da visualViewport come variabile CSS. */
function useKeyboardInset(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const el = ref.current;
    const vv = window.visualViewport;
    if (!el || !vv || !active) return;
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.setProperty("--dock-keyboard-inset", `${Math.round(inset)}px`);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      el.style.removeProperty("--dock-keyboard-inset");
    };
  }, [ref, active]);
}

/* ═══ MOBILE BOTTOM BAR ═══
   U-5: alla ricerca i tab lasciano posto al campo (la capsula si trasforma) e
   il cerchio della lente diventa «Annulla». */
function BottomTabBar({
  activeTab,
  onSearchOpen,
  navState,
  search,
}: {
  activeTab: string | null;
  onSearchOpen: () => void;
  navState: LiquidNavState;
  search: DockSearch;
}) {
  const { cms } = useCms();
  const prefersReducedMotion = useReducedMotion();
  const dockRef = useRef<HTMLDivElement>(null);
  useKeyboardInset(dockRef, search.open);
  const hidden = navState.hidden && !search.open;
  const { scrolled } = navState;
  const morph = prefersReducedMotion ? { duration: 0 } : navSpring;
  return (
    <motion.div
      ref={dockRef}
      className={`app-shell-dock${scrolled ? " app-shell-dock--scrolled" : ""}${hidden ? " app-shell-dock--hidden" : ""}${search.open ? " app-shell-dock--search" : ""}`}
      initial={{ y: 0, scale: 1, opacity: 1 }}
      animate={{
        y: hidden && !prefersReducedMotion ? 96 : 0,
        scale: hidden && !prefersReducedMotion ? 0.98 : scrolled ? 0.99 : 1,
        opacity: hidden ? 0 : 1,
      }}
      transition={
        prefersReducedMotion
          ? { duration: motionDuration.fast,ease: motionEase.exit }
          : {
              y: navSpring,
              scale: navSpring,
              opacity: { duration: hidden ? motionDuration.subtle : motionDuration.normal,ease: motionEase.exit },
            }
      }
    >
      {search.open ? (
        <motion.div
          layoutId="dock-capsule"
          transition={morph}
          role="search"
          className="app-shell-dock__nav app-shell-dock__nav--search"
        >
          <SearchField
            variant="dock"
            value={search.query}
            onChange={search.onQueryChange}
            inputRef={search.inputRef}
            onKeyDown={search.onKeyDown}
          />
        </motion.div>
      ) : (
      <motion.nav
        layoutId="dock-capsule"
        transition={morph}
        data-region="nav"
        className="app-shell-dock__nav"
        aria-label={cms.pages.navMainLabel}
      >
        <motion.span
          aria-hidden="true"
          className="app-shell-dock__gloss"
          animate={{ opacity: 0.26 }}
        />
        <div className="app-shell-dock__row">
          {TABS.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              layout="bottom"
            />
          ))}
        </div>
      </motion.nav>
      )}

      {/* Floating Search Circle next to it — landmark «search» (U-10, F29) */}
      {search.open ? (
        <motion.button
          layoutId="dock-action"
          transition={morph}
          type="button"
          onClick={search.onCancel}
          className="app-shell-dock__cancel"
        >
          {cms.ui.cancel}
        </motion.button>
      ) : (
        <motion.div layoutId="dock-action" transition={morph} role="search" className="app-shell-dock__search">
          <SearchButton
            size="lg"
            onOpen={onSearchOpen}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══ DESKTOP SIDEBAR RAIL ═══ */
function SidebarRail({
  activeTab,
  devMode,
  onSearchOpen,
}: {
  activeTab: string | null;
  devMode: boolean;
  onSearchOpen: () => void;
}) {
  const { cms } = useCms();
  return (
    <div className="app-shell-rail">
      {/* Navigation Capsule (Logo + Tabs) */}
      <motion.nav
        data-region="nav"
        className="app-shell-rail__nav"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={motionSpring.gentle}
        aria-label={cms.pages.navMainLabel}
      >
        <motion.span
          aria-hidden="true"
          className="app-shell-rail__gloss"
          animate={{ opacity: 0.42 }}
        />
        {/* Logo */}
        <Link
          to="/"
          className="app-shell-rail__logo"
          aria-label={cms.pages.homeAria}
        >
          <VulcanMark size={22} decorative />
        </Link>

        {/* Tabs */}
        <div className="app-shell-rail__tabs">
          {TABS.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              layout="rail"
            />
          ))}
        </div>

        <div role="search" className="app-shell-rail__search">
          <SearchButton
            size="sm"
            onOpen={onSearchOpen}
          />
        </div>

        {/* Dev shortcut (subtle) */}
        {devMode && (
          <div className="app-shell-rail__dev">
            <Link
              to="/dev"
              className="app-shell-rail__dev-link"
              aria-label={cms.pages.devToolsAria}
              title="Ctrl+Shift+D"
            >
              <span className="app-shell-rail__dev-icon">{"</>"}</span>
            </Link>
          </div>
        )}
      </motion.nav>

    </div>
  );
}

/* ═══ MARCHIO IN TESTATA — logo nel blob d'impasto + nome (D-040) ═══ */
function ShellBrand() {
  const { cms } = useCms();
  return (
    <Link to="/explore" className="app-shell-brand" aria-label={cms.pages.homeAria}>
      <VulcanHero size={36} energy={30} markRatio={0.5} />
      <span className="app-shell-brand__name" aria-hidden="true">{BRAND.name}</span>
    </Link>
  );
}

/* ═══ PROFILE BUTTON — fixed top-right, sostituisce la tab Profilo ═══
   Audit Sprint 12: Profilo è impostazione utente, non una tab di navigazione. */
function ProfileButton({ active, navState }: { active: boolean; navState: LiquidNavState }) {
  const { cms } = useCms();
  const prefersReducedMotion = useReducedMotion();
  const label = (cms.pages as any)?.navProfile || "Profilo";
  const { scrolled, nearBottom } = navState;
  /* A fondo pagina il force-show serve al dock di navigazione, non a questo
     avatar: qui ricomparirebbe SOPRA i contenuti (badge card, titoli). */
  const hidden = navState.hidden || (nearBottom && scrolled);
  const size = scrolled ? 40 : 44;
  return (
    <MotionLink
      to="/profile"
      className={`app-shell-profile${scrolled ? " app-shell-profile--scrolled" : ""}${hidden ? " app-shell-profile--hidden" : ""}`}
      animate={{
        width: size,
        height: size,
        borderRadius: scrolled ? "14px" : "16px",
        y: hidden && !prefersReducedMotion ? -(size + 24) : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={motionSpring.quick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={label}
    >
      <User size={18} />
    </MotionLink>
  );
}

/* ═══ COOK SESSION UI — widget flottante + overlay full-screen ═══
   La "pizzata attiva" vive a livello di shell: segue l'utente su ogni pagina. */
function CookSessionUI({
  canStartRecipe,
  hasProfileButton,
  showAction,
  compact,
  hidden,
}: {
  canStartRecipe: boolean;
  hasProfileButton: boolean;
  showAction: boolean;
  compact: boolean;
  hidden: boolean;
}) {
  const { session, overlayOpen } = useCookSession();
  return (
    <>
      {showAction && (
        <ActiveCookWidget
          canStartRecipe={canStartRecipe}
          hasProfileButton={hasProfileButton}
          compact={compact}
          hidden={hidden}
        />
      )}
      <AnimatePresence>
        {overlayOpen && session && (
          <Suspense fallback={null}>
            <CookingMode />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══ APP SHELL ═══ */
export function AppShell() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(loadThemeMode);
  const [darkMode, setDarkModeState] = useState(() => resolveThemeMode(loadThemeMode()));
  const [devMode, setDevModeState] = useState(loadDevMode);
  const [isOverlayDeactivated, setIsOverlayDeactivated] = useState(() => {
    try {
      return localStorage.getItem("vulcan_debug_overlay_deactivated") !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setIsOverlayDeactivated(localStorage.getItem("vulcan_debug_overlay_deactivated") === "true");
      } catch {}
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vulcan_debug_toggle", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vulcan_debug_toggle", handleStorageChange);
    };
  }, []);

  /* U-5 — ricerca a tutta pagina. La query vive qui perché il campo sta nel
     dock (mobile) e i risultati al posto della pagina; il chunk dei risultati
     si scarica alla prima apertura. */
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMounted, setSearchMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchKeyRef: MutableRefObject<((event: ReactKeyboardEvent<HTMLInputElement>) => void) | null> = useRef(null);
  /* Da dove si è partiti: scroll e focus tornano lì con «Annulla». */
  const searchReturnRef = useRef<{ scrollY: number; focus: HTMLElement | null } | null>(null);
  const isMobile = useIsMobile();
  const [hideNavbar, setHideNavbar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navState = useLiquidNavState();
  const prefersReducedMotion = useReducedMotion();

  // Reset hideNavbar state during render when the pathname changes to avoid race conditions with children
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setHideNavbar(false);
    /* Indietro del browser con la ricerca aperta: si va alla pagina, la
       ricerca si chiude. */
    if (searchOpen) {
      setSearchOpen(false);
      setSearchQuery("");
      searchReturnRef.current = null;
    }
  }

  const setThemeMode = useCallback((v: ThemeMode) => {
    setThemeModeState(v);
    saveThemeMode(v);
    setDarkModeState(resolveThemeMode(v));
  }, []);

  const setDarkMode = useCallback((v: boolean) => {
    const newMode = v ? "dark" : "light";
    setThemeModeState(newMode);
    saveThemeMode(newMode);
    setDarkModeState(v);
  }, []);

  /* Listen for system theme changes when in auto mode */
  useEffect(() => {
    if (themeMode !== "auto") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDarkModeState(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [themeMode]);

  const setDevMode = useCallback((v: boolean) => {
    setDevModeState(v);
    saveDevMode(v);
  }, []);

  const openSearch = useCallback(() => {
    setSearchMounted(true);
    setSearchOpen((wasOpen) => {
      if (!wasOpen) {
        searchReturnRef.current = {
          scrollY: window.scrollY,
          focus: document.activeElement instanceof HTMLElement ? document.activeElement : null,
        };
      }
      return true;
    });
  }, []);

  /* «Annulla» ed Esc: si torna dove si era, con lo stesso scroll e focus. */
  const cancelSearch = useCallback(() => {
    const back = searchReturnRef.current;
    searchReturnRef.current = null;
    setSearchOpen(false);
    setSearchQuery("");
    requestAnimationFrame(() => {
      if (back) window.scrollTo(0, back.scrollY);
      window.dispatchEvent(new Event(NAV_RESYNC_EVENT));
      /* La lente del dock si rimonta con la trasformazione: se il pulsante
         salvato non c'è più, il focus va a quella nuova. */
      const target = back?.focus?.isConnected
        ? back.focus
        : document.querySelector<HTMLElement>(".app-shell-dock__search .search-button");
      target?.focus({ preventScroll: true });
    });
  }, []);

  /* Scelta di un risultato: il link (o Invio) porta alla pagina, che parte
     dall'alto. */
  const selectSearchResult = useCallback(
    (link?: string) => {
      searchReturnRef.current = null;
      setSearchOpen(false);
      setSearchQuery("");
      if (link) navigate(link);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    },
    [navigate],
  );

  const onSearchKeyDown = useCallback((event: ReactKeyboardEvent<HTMLInputElement>) => {
    searchKeyRef.current?.(event);
  }, []);

  useEffect(() => {
    window.addEventListener("vulcan:open-search", openSearch);
    return () => window.removeEventListener("vulcan:open-search", openSearch);
  }, [openSearch]);

  /* All'apertura: risultati dall'alto e focus nel campo (dock o testata). */
  useEffect(() => {
    if (!searchOpen) return;
    window.scrollTo(0, 0);
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus({ preventScroll: true }));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancelSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, cancelSearch]);

  /* Apply .dark on <html> so portals inherit tokens */
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (darkMode) cl.add("dark");
    else cl.remove("dark");
    /* Mantiene coerente il colore impostato dallo script anti-FOUC di
       index.html anche quando il tema cambia in-app (overscroll/rubber-band). */
    document.documentElement.style.backgroundColor = "var(--container-page)";
  }, [darkMode]);

  /* Ctrl+Shift+D shortcut + ⌘K / Ctrl+K search */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      /* ⌘K / Ctrl+K — open search */
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (searchOpen) cancelSearch();
        else openSearch();
        return;
      }
      /* Ctrl+Shift+D — dev mode toggle */
      if (TOOLS_ENABLED && e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        const isDev = window.location.pathname.startsWith("/dev");
        if (isDev) {
          navigate("/");
        } else {
          setDevMode(!devMode);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, devMode, setDevMode, searchOpen, cancelSearch, openSearch]);

  const activeTab = getActiveTab(location.pathname);

  /* Determine if tab bar should be visible
     Hidden on: /dev, /design-system, /cms (tool pages) or /recipe/:styleId or when hideNavbar is true */
  const isToolPage =
    location.pathname.startsWith("/dev") ||
    location.pathname.startsWith("/design-system") ||
    location.pathname.startsWith("/cms");
  const isRecipePage = location.pathname.startsWith("/recipe/");
  /* Audit totale n. 13: anche la ricetta generata in Crea si può cucinare. */
  const [cookAvailable, setCookAvailable] = useState(false);
  useEffect(() => {
    const onAvailable = (event: Event) => setCookAvailable(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("vulcan:cook-available", onAvailable);
    return () => window.removeEventListener("vulcan:cook-available", onAvailable);
  }, []);
  const showNav = !isToolPage && !isRecipePage && !hideNavbar;
  /* La ricetta di Crea nasconde la navigazione ma si cucina (audit n. 13). */
  const showCookAction = !isToolPage && (!hideNavbar || cookAvailable);
  const hasProfileButton = showNav && activeTab !== "profile" && !searchOpen;
  /* Il campo sta nel dock solo dove il dock c'è (mobile, pagine con i tab);
     altrove la pagina dei risultati ha il suo. */
  const searchInDock = showNav && isMobile === true;

  return (
    <CmsProvider>
      <StylesOverrideProvider>
        <CookSessionProvider>
        <div className="app-shell-root">
          <SkipLink />
          {/* Sidebar rail — desktop */}
          {showNav && (
            <SidebarRail
              activeTab={activeTab}
              devMode={devMode}
              onSearchOpen={openSearch}
            />
          )}

          {/* Audit Sprint 12 — Profilo top-right (sostituisce la tab Profilo). */}
          {showNav && activeTab !== "profile" && !searchOpen && (
            /* U-10 (F29): l'avatar sta in un landmark (banner) come il resto della shell */
            <header className="app-shell-header">
              <ProfileButton active={activeTab === "profile"} navState={navState} />
              {/* Marchio in testata (D-040): solo sulle pagine delle tab, su
                  mobile; su desktop il logo sta già nella barra laterale. Nel
                  banner, non fuori dai landmark (audit n. 30). */}
              {TABS.some((tab) => tab.path === location.pathname) && <ShellBrand />}
            </header>
          )}

          {/* Main content area */}
          <div
            id="app-content"
            tabIndex={-1}
            className={`app-shell-main${showNav ? " app-shell-main--nav" : ""}`}
          >
            <RouteTitle />
            {/* U-5: la pagina resta montata (stato e scroll salvi) e si nasconde
                mentre i risultati ne prendono il posto. */}
            <div className="app-shell-page" hidden={searchOpen}>
              <Outlet
                context={{ darkMode, setDarkMode, themeMode, setThemeMode, devMode, setDevMode, hideNavbar, setHideNavbar } satisfies DarkModeContext}
              />
            </div>
            {searchMounted && searchOpen && (
              <Suspense fallback={null}>
                <SearchResultsView
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  onSelect={selectSearchResult}
                  keyHandlerRef={searchKeyRef}
                  field={
                    searchInDock ? undefined : (
                      <PageSearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        inputRef={searchInputRef}
                        onKeyDown={onSearchKeyDown}
                        onCancel={cancelSearch}
                      />
                    )
                  }
                />
              </Suspense>
            )}
          </div>

          {/* Bottom tab bar — mobile */}
          {showNav && (
            <>
              {/* Bottom scrim — visually grounds the floating tab bar on mobile */}
              <motion.div
                className="app-shell-scrim"
                initial={{ y: 0, opacity: 1 }}
                animate={{
                  y: navState.hidden && !prefersReducedMotion ? 48 : 0,
                  opacity: navState.hidden ? 0 : 1,
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: motionDuration.fast,ease: motionEase.exit }
                    : {
                        y: navSpring,
                        opacity: { duration: navState.hidden ? motionDuration.subtle : motionDuration.normal,ease: motionEase.exit },
                      }
                }
              />
              <BottomTabBar
                activeTab={activeTab}
                onSearchOpen={openSearch}
                navState={navState}
                search={{
                  open: searchOpen && searchInDock,
                  query: searchQuery,
                  onQueryChange: setSearchQuery,
                  onCancel: cancelSearch,
                  inputRef: searchInputRef,
                  onKeyDown: onSearchKeyDown,
                }}
              />
            </>
          )}

          {/* Pizzata attiva: sticky action + overlay (cross-page) */}
          <CookSessionUI
            canStartRecipe={isRecipePage || cookAvailable}
            hasProfileButton={hasProfileButton}
            showAction={showCookAction && !searchOpen}
            compact={navState.scrolled}
            /* Come il ProfileButton: a fondo pagina il force-show serve al
               dock in basso, non ai flottanti in alto (audit lug 2026). Una
               pizzata ATTIVA resta comunque visibile (gestito nel widget). */
            hidden={navState.hidden || (navState.nearBottom && navState.scrolled)}
          />

          {/* Strumento di debug AI per annotazioni e bug-fix (se non disattivato nelle impostazioni) */}
          {!isOverlayDeactivated && (
            <DebugOverlay />
          )}

          {/* Theme explorer — confronto temi rivista di cucina (fase esplorativa) */}
          <ThemeSwitcher />
        </div>
        </CookSessionProvider>
      </StylesOverrideProvider>
    </CmsProvider>
  );
}
