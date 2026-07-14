import { ArrowLeft,Moon,Sun } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { DesignSystemTab } from "../components/design-system/index";
import { Surface } from "../components/ds/index";
import { useDarkMode } from "../hooks/use-dark-mode";
import "../components/design-system/showcase.css";
import { showcaseMessage } from "../i18n/showcase-messages";

/**
 * Standalone Design System page at /design-system
 * Full-page view without Dev Tools chrome — optimised for
 * screenshotting.
 */
export function DesignSystemPage() {
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();

  return (
    <main className="ds-showcase">
      {/* Minimal sticky header */}
      <Surface as="header" variant="glass" className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 active:scale-95 transition-transform dsx-s-cf4f387037"
              aria-label={showcaseMessage("pages.design-system.torna-all-app-86641218")}
            >
              <ArrowLeft size={16} />
              <span>{showcaseMessage("pages.design-system.app-fc4a695f")}</span>
            </motion.button>
            <div
              className="w-px h-5 dsx-s-b72787883f"
            />
            <span
              className="type-body-sm dsx-s-f033b89e21"
            >
              {showcaseMessage("pages.design-system.design-system-e635ad53")}</span>
            <span
              className="type-label dsx-s-b0aecf2e21"
            >
              {showcaseMessage("pages.design-system.interactive-ffc4bf2e")}</span>
          </div>
          <motion.button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center w-8 h-8 rounded-lg active:scale-95 transition-transform dsx-s-e5d78b9523"
            aria-label={
              darkMode
                ? showcaseMessage("pages.design-system.passa-a-light-mode-2ee1a984")
                : showcaseMessage("pages.design-system.passa-a-dark-mode-b6cac547")
            }
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
        </div>
      </Surface>

      {/* Full-width spec sheet */}
      <article className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <DesignSystemTab
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </article>
    </main>
  );
}
