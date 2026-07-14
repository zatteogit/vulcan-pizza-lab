import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useCms } from "../features/cms/cms-context";
import { CtaButton, Heading } from "../components/ds/index";
import { motionSpring } from "../components/ds/motion";

export function NotFoundPage() {
  const { cms } = useCms();
  return (
    <main className="notfound-shell" id="main-content">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSpring.pageEnter}
        className="notfound-card"
      >
        <span className="type-step-num notfound-num">404</span>
        <Heading level="page" className="notfound-title">
          {cms.pages.notFoundTitle}
        </Heading>
        <p className="notfound-sub">
          {cms.pages.notFoundSubtitle}
        </p>
        <CtaButton
          as={Link}
          to="/"
          className="notfound-cta"
        >
          <ArrowLeft size={14} />
          {cms.pages.notFoundBack}
        </CtaButton>
      </motion.div>
    </main>
  );
}
