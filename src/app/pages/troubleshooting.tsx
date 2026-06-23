/* === TROUBLESHOOTING PAGE === */
/* Route /learn/troubleshooting — guida completa problemi pizza */

import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { TroubleshootingGuide } from "../features/recipe/troubleshooting-panel";
import { VulcanMark } from "../components/shared/vulcan-logo";
import { useCms } from "../features/cms/cms-context";
import { Surface } from "../components/ds/index";

export default function TroubleshootingPage() {
  const { cms } = useCms();
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {/* Header */}
      <Surface as="header" variant="glass" className="sticky top-0 z-50 h-14 sm:h-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link
            to="/learn"
            data-back-button="true"
            className="flex items-center gap-1 -ml-1 active:scale-95 transition-transform"
            style={{
              color: "var(--text-accent)",
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--weight-semibold)",
            }}
          >
            <ChevronLeft size={18} />
            <span>{cms.pages.navLearn}</span>
          </Link>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--hero-brand-gradient)",
              color: "var(--overlay-text)",
            }}
          >
            <VulcanMark size={16} decorative />
          </div>
        </div>
      </Surface>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24"
      >
        <TroubleshootingGuide />
      </motion.main>
    </div>
  );
}
