/* Theme system — culinary-magazine directions the user can switch between.
   Lives under dev-tools during the exploration phase (hardcoded IT copy is
   lint-exempt here). Two surfaces:
     · ThemeControls  → embedded in Profilo (pick theme + toggle quick-switch)
     · ThemeSwitcher  → optional floating pill for fast cross-page comparison
   State is plain localStorage + a window event so both surfaces + the shell
   stay in sync. data-theme on <html> drives the CSS in theme.css. */
import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "vulcan_theme";
const SWITCHER_KEY = "vulcan_theme_switcher";
const SYNC_EVENT = "vulcan:theme-change";

export interface ThemeMeta {
  id: string;
  /** data-theme used to preview this theme's own type/accent in the picker. */
  preview: string;
  label: string;
  note: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "", preview: "vulcan", label: "Vulcan", note: "L'originale · Playfair" },
];

function applyTheme(id: string) {
  const el = document.documentElement;
  if (id) el.dataset.theme = id;
  else delete el.dataset.theme;
}

function readStr(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStr(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage restricted */
  }
  window.dispatchEvent(new Event(SYNC_EVENT));
}

/** Shared theme + quick-switcher state, synced across every mounting surface. */
export function useThemeControl() {
  const [theme, setThemeState] = useState(() => readStr(THEME_KEY, ""));
  const [switcherOn, setSwitcherState] = useState(
    () => readStr(SWITCHER_KEY, "false") === "true",
  );

  useEffect(() => {
    const sync = () => {
      setThemeState(readStr(THEME_KEY, ""));
      setSwitcherState(readStr(SWITCHER_KEY, "false") === "true");
    };
    window.addEventListener(SYNC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setTheme = useCallback((id: string) => {
    applyTheme(id);
    writeStr(THEME_KEY, id);
  }, []);

  const setSwitcherOn = useCallback((on: boolean) => {
    writeStr(SWITCHER_KEY, String(on));
  }, []);

  return { theme, setTheme, switcherOn, setSwitcherOn };
}

/* ═══ Profile-embedded controls ═══ */
export function ThemeControls() {
  const { theme, setTheme, switcherOn, setSwitcherOn } = useThemeControl();

  return (
    <div>
      <div
        className="type-data mb-2"
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--text-muted)",
          fontWeight: "var(--weight-semibold)" as unknown as number,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Tema
      </div>

      <div className="grid grid-cols-2 gap-2">
        {THEMES.map((t) => {
          const active = t.id === theme;
          return (
            <button
              key={t.id || "default"}
              type="button"
              onClick={() => setTheme(t.id)}
              aria-pressed={active}
              data-theme={t.preview}
              className="flex flex-col items-start gap-1 px-3.5 py-3 text-left active:scale-98 transition-transform"
              style={{
                borderRadius: "var(--radius-lg)",
                background: active
                  ? "color-mix(in srgb, var(--primary) 8%, var(--surface-container-low))"
                  : "var(--surface-container-low)",
                border: active
                  ? "1.5px solid var(--primary)"
                  : "1.5px solid var(--outline-variant)",
                cursor: "pointer",
              }}
            >
              <span className="flex items-center gap-2 w-full">
                <span
                  aria-hidden="true"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "var(--radius-full)",
                    background: "var(--primary)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-serif-family)",
                    fontSize: "var(--font-size-2-5xl)",
                    fontWeight: 600,
                    /* --on-surface è ridefinito dal [data-theme] della tessera
                       stessa (i temi scuri come Insegna restano leggibili);
                       --text-default risolverebbe sul tema di pagina. */
                    color: "var(--on-surface)",
                    lineHeight: 1.1,
                  }}
                >
                  {t.label}
                </span>
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans-family)",
                  fontSize: "var(--font-size-xs)",
                  color: active
                    ? "var(--on-surface)"
                    : "var(--on-surface-variant)",
                  opacity: active ? 0.8 : 0.75,
                }}
              >
                {t.note}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick-switch toggle: the floating pill for comparing across pages */}
      <button
        type="button"
        onClick={() => setSwitcherOn(!switcherOn)}
        aria-pressed={switcherOn}
        className="flex items-center gap-3 w-full mt-3 px-3.5 py-3 active:scale-99 transition-transform"
        style={{
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-container-low)",
          border: "1px solid var(--outline-variant)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--weight-semibold)" as unknown as number,
              color: "var(--text-default)",
            }}
          >
            Selettore rapido ovunque
          </div>
          <div
            className="type-body-xs"
            style={{ color: "var(--text-muted)", marginTop: 1 }}
          >
            Mostra una pillola per cambiare tema da ogni schermata
          </div>
        </div>
        <span
          aria-hidden="true"
          className="flex-shrink-0 flex items-center transition-colors"
          style={{
            width: 44,
            height: 26,
            borderRadius: "var(--radius-full)",
            padding: 3,
            background: switcherOn ? "var(--primary)" : "var(--switch-background)",
            justifyContent: switcherOn ? "flex-end" : "flex-start",
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "var(--radius-full)",
              background: "var(--surface-bright)",
              boxShadow: "var(--slider-thumb-shadow)",
            }}
          />
        </span>
      </button>
    </div>
  );
}

/* ═══ Floating quick-switcher (opt-in from Profilo) ═══ */
export function ThemeSwitcher() {
  const { theme, setTheme, switcherOn } = useThemeControl();
  if (!switcherOn) return null;

  return (
    <div
      className="fixed left-3 flex items-center gap-1 p-1"
      style={{
        top: "calc(var(--space-4) + env(safe-area-inset-top, 0px))",
        zIndex: 79,
        borderRadius: "var(--radius-full)",
        background: "color-mix(in srgb, var(--container-page) 82%, transparent)",
        border: "1px solid var(--container-border-ghost)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        boxShadow: "var(--shadow-lg)",
      }}
      role="group"
      aria-label="Tema"
    >
      {THEMES.map((t) => {
        const active = t.id === theme;
        return (
          <button
            key={t.id || "default"}
            type="button"
            onClick={() => setTheme(t.id)}
            aria-pressed={active}
            className="px-2.5 py-1 transition-colors active:scale-95"
            style={{
              borderRadius: "var(--radius-full)",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--font-size-md)",
              fontWeight: active
                ? ("var(--weight-semibold)" as unknown as number)
                : ("var(--weight-medium)" as unknown as number),
              color: active ? "var(--primary-foreground)" : "var(--text-muted)",
              background: active ? "var(--primary)" : "transparent",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
