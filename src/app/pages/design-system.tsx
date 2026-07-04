import { ArrowLeft,Moon,Sun } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { DesignSystemTab } from "../components/design-system/index";
import { Surface } from "../components/ds/index";
import { useDarkMode } from "../hooks/use-dark-mode";

/**
 * Standalone Design System page at /design-system
 * Full-page view without Dev Tools chrome — optimised for
 * screenshotting.
 */
export function DesignSystemPage() {
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {/* Minimal sticky header */}
      <Surface as="header" variant="glass" className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 active:scale-95 transition-transform"
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--weight-semibold)" as any,
                color: "var(--text-accent)",
              }}
              aria-label="Torna all'app"
            >
              <ArrowLeft size={16} />
              <span>App</span>
            </motion.button>
            <div
              className="w-px h-5"
              style={{ background: "var(--container-border)" }}
            />
            <span
              className="type-body-sm"
              style={{
                fontWeight: "var(--weight-semibold)" as any,
                letterSpacing: "var(--tracking-spread)",
                color: "var(--text-default)",
              }}
            >
              Design System
            </span>
            <span
              className="type-label"
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
              }}
            >
              Interactive
            </span>
          </div>
          <motion.button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center w-8 h-8 rounded-lg active:scale-95 transition-transform"
            style={{
              background:
                "color-mix(in srgb, var(--text-accent) 10%, transparent)",
              color: "var(--text-accent)",
            }}
            aria-label={
              darkMode
                ? "Passa a Light mode"
                : "Passa a Dark mode"
            }
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
        </div>
      </Surface>

      {/* Full-width spec sheet */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <DesignSystemTab
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </div>
    </div>
  );
}
