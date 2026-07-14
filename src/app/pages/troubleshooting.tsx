/* === TROUBLESHOOTING PAGE === */
/* Route /learn/troubleshooting — guida completa problemi pizza */

import { motion } from "motion/react";
import { useSearchParams } from "react-router";
import { TroubleshootingGuide } from "../features/recipe/troubleshooting-panel";
import { SubPageHeader } from "../components/shared/sub-page-header";
import { useCms } from "../features/cms/cms-context";
import { motionSpring } from "../components/ds/motion";

export default function TroubleshootingPage() {
  const { cms } = useCms();
  // Deep-link dalle fasi della ricetta ("è andata lunga?"): ?issue=Pxx
  const [searchParams] = useSearchParams();
  const initialIssueId = searchParams.get("issue") ?? undefined;
  return (
    <div className="min-h-screen troubleshooting-shell">
      {/* Header — pattern condiviso (il titolo vive nell'hero della guida) */}
      <SubPageHeader backTo="/learn" backLabel={cms.pages.navLearn} />

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSpring.standard}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24"
        data-region="page"
      >
        <TroubleshootingGuide initialIssueId={initialIssueId} />
      </motion.main>
    </div>
  );
}
