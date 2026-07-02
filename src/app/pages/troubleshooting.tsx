/* === TROUBLESHOOTING PAGE === */
/* Route /learn/troubleshooting — guida completa problemi pizza */

import { motion } from "motion/react";
import { TroubleshootingGuide } from "../features/recipe/troubleshooting-panel";
import { SubPageHeader } from "../components/shared/sub-page-header";
import { useCms } from "../features/cms/cms-context";

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
      {/* Header — pattern condiviso (il titolo vive nell'hero della guida) */}
      <SubPageHeader backTo="/learn" backLabel={cms.pages.navLearn} />

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
