import { useLiquidNavState, NAV_RESYNC_EVENT, type LiquidNavState } from "../../hooks/use-liquid-nav";
/* === APP SHELL — VPL-055 / VPL-072 ===
   Layout principale con Tab Bar Material 3.
   Mobile: bottom bar 3 tab + search FAB, compact on downward scroll.
   Desktop: sidebar rail + search icon.
   ⌘K / Ctrl+K apre la ricerca a tutta pagina (U-5). */

import {
Compass,
Flame,
GraduationCap,
User,
} from "lucide-react";
import { AnimatePresence,motion,useReducedMotion } from "motion/react";
import { Suspense,lazy,useCallback,useEffect,useLayoutEffect,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type MutableRefObject,type RefObject } from "react";
import { Link,Outlet,useLocation,useNavigate,useNavigationType } from "react-router";
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
const AboutDialog = lazy(() => import("./about-dialog").then(m => ({ default: m.AboutDialog })));
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
import { IconButton } from "../ds/index";
import { useEscapeLayer } from "../ds/escape-stack";
import { VulcanHero } from "./vulcan-hero";
import { BRAND } from "../../config/brand";
import { EDITION } from "../../config/edition";
import { motionSpring } from "../ds/motion";
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
  const compact = navState.compact && !search.open;
  const { scrolled } = navState;
  const morph = prefersReducedMotion ? { duration: 0 } : navSpring;
  return (
    <motion.div
      ref={dockRef}
      className={`app-shell-dock${scrolled ? " app-shell-dock--scrolled" : ""}${compact ? " app-shell-dock--compact" : ""}${search.open ? " app-shell-dock--search" : ""}`}
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
  onAboutOpen,
  searchOpen = false,
}: {
  activeTab: string | null;
  /** FW-12 (S04-B-18): a ricerca aperta la lente è lo stato attivo, non la tab. */
  searchOpen?: boolean;
  devMode: boolean;
  onSearchOpen: () => void;
  onAboutOpen: () => void;
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
        <IconButton
          variant="bare"
          type="button"
          onClick={onAboutOpen}
          className="app-shell-rail__logo"
          aria-label={cms.ui.aboutLabel}
          aria-haspopup="dialog"
        >
          {/* FW-12 (S01-B-05): un solo ciclo, poi fermo (WCAG 2.2.2). */}
          <VulcanHero size={48} energy={35} markRatio={0.46} loops={0} />
        </IconButton>

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
            active={searchOpen}
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
function ShellBrand({ onAboutOpen }: { onAboutOpen: () => void }) {
  const { cms } = useCms();
  // Co-branding delle edizioni dedicate: «Vulcan · per <partner>».
  const partner = EDITION.partner ? uiMessage("edition.partner", [EDITION.partner.name]) : null;
  return (
    <IconButton variant="bare" type="button" onClick={onAboutOpen} className="app-shell-brand"
      aria-label={partner ? `${cms.ui.aboutLabel} · ${partner}` : cms.ui.aboutLabel} aria-haspopup="dialog">
      {/* FW-12 (S01-B-05): un solo ciclo, poi fermo (WCAG 2.2.2). */}
      <VulcanHero size={42} energy={45} markRatio={0.5} loops={0} />
      <span className="app-shell-brand__name" aria-hidden="true">{BRAND.name}</span>
      {partner && <span className="app-shell-brand__partner type-data-sm" aria-hidden="true">{partner}</span>}
    </IconButton>
  );
}

/* ═══ PROFILE BUTTON — fixed top-right, sostituisce la tab Profilo ═══
   Audit Sprint 12: Profilo è impostazione utente, non una tab di navigazione. */
function ProfileButton({ active, navState }: { active: boolean; navState: LiquidNavState }) {
  const { cms } = useCms();
  const label = (cms.pages as any)?.navProfile || "Profilo";
  const { scrolled } = navState;
  /* FW-13: misura e raggio vivono in CSS (.app-shell-profile--scrolled). */
  return (
    <MotionLink
      to="/profile"
      className={`app-shell-profile${scrolled ? " app-shell-profile--scrolled" : ""}`}
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
}: {
  canStartRecipe: boolean;
  hasProfileButton: boolean;
  showAction: boolean;
  compact: boolean;
}) {
  const { session, overlayOpen } = useCookSession();
  return (
    <>
      {/* FW-13: la posizione accanto al profilo è una classe con token. */}
      <div
        className={`cook-actions${hasProfileButton ? " cook-actions--beside-profile" : ""}${compact ? " cook-actions--compact" : ""}`}
        hidden={!showAction || overlayOpen}
      >
        {showAction && (
        <ActiveCookWidget
          canStartRecipe={canStartRecipe}
          hasProfileButton={hasProfileButton}
          compact={compact}
          inline
        />
        )}
        <div id="recipe-floating-actions" className="cook-actions__recipe" />
      </div>
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
  const [aboutOpen, setAboutOpen] = useState(false);
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
     dall'alto. FW-04 (S04-A-04, S12-B-01): con un'ancora (#termine) lo
     scorrimento lo fa la pagina (useHashTarget); qui non si torna in cima. */
  const selectSearchResult = useCallback(
    (link?: string) => {
      searchReturnRef.current = null;
      setSearchOpen(false);
      setSearchQuery("");
      if (link) navigate(link);
      if (link?.includes("#")) return;
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

  /* Audit n. 35: una pagina nuova parte dall'alto. Indietro/avanti (POP)
     lasciano lo scroll al browser; un'ancora (#…) la gestisce la pagina. */
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType === "POP" || location.hash) return;
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash, navigationType]);

  /* All'apertura: risultati dall'alto e focus nel campo (dock o testata). */
  useEffect(() => {
    if (!searchOpen) return;
    window.scrollTo(0, 0);
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [searchOpen]);
  /* FW-12: la ricerca aperta è uno strato dell'escape-stack, come i dialog. */
  useEscapeLayer(searchOpen, cancelSearch);

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
     Hidden on: /dev, /design-system, /cms (tool pages) or /recipe/:styleId, /profile or when hideNavbar is true */
  const isToolPage =
    location.pathname.startsWith("/dev") ||
    location.pathname.startsWith("/design-system") ||
    location.pathname.startsWith("/cms");
  const isRecipePage = location.pathname.startsWith("/recipe/");
  const isProfilePage = activeTab === "profile";
  /* Audit totale n. 13: anche la ricetta generata in Crea si può cucinare. */
  const [cookAvailable, setCookAvailable] = useState(false);
  // Prima degli effect della ricetta: al primo caricamento il suo evento non
  // deve andare perso, altrimenti anche una ricetta fattibile perde «Inizia».
  useLayoutEffect(() => {
    const onAvailable = (event: Event) => setCookAvailable(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("vulcan:cook-available", onAvailable);
    return () => window.removeEventListener("vulcan:cook-available", onAvailable);
  }, []);
  const showNav = !isToolPage && !isRecipePage && !isProfilePage && !hideNavbar;
  /* La ricetta di Crea nasconde la navigazione ma si cucina (audit n. 13). */
  const showCookAction = !isToolPage && !isProfilePage && (!hideNavbar || cookAvailable);
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
          {aboutOpen && <Suspense fallback={null}><AboutDialog onClose={() => setAboutOpen(false)} /></Suspense>}
          {/* Sidebar rail — desktop */}
          {showNav && (
            <SidebarRail
              activeTab={searchOpen ? null : activeTab}
              searchOpen={searchOpen}
              devMode={devMode}
              onAboutOpen={() => setAboutOpen(true)}
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
              {TABS.some((tab) => tab.path === location.pathname) && <ShellBrand onAboutOpen={() => setAboutOpen(true)} />}
            </header>
          )}

          {/* Pizzata attiva: sticky action + overlay (cross-page).
              FW-12 (S07-B-10): prima di <main> nel DOM, come a schermo (in
              alto a destra): il segnalibro della ricetta, portato qui, è la
              seconda fermata del Tab e non la 32ª. */}
          <CookSessionUI
            canStartRecipe={cookAvailable}
            hasProfileButton={hasProfileButton}
            showAction={showCookAction && !searchOpen}
            compact={navState.scrolled}
          />

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
