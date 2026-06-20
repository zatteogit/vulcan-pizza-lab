import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useCms } from "../components/cms/cms-context";
import { CtaButton, Heading } from "../components/ds";

export function NotFoundPage() {
  const { cms } = useCms();
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
        }}
        className="text-center px-6"
      >
        <span
          className="type-step-num"
          style={{
            fontWeight: "var(--weight-bold)" as any,
            color: "var(--text-accent)",
          }}
        >
          404
        </span>
        <Heading level="page" className="mt-2">
          {cms.pages.notFoundTitle}
        </Heading>
        <p
          className="font-serif italic mt-2"
          style={{
            fontSize: "var(--font-size-xl-5)",
            color: "var(--text-muted)",
            opacity: 0.65,
          }}
        >
          {cms.pages.notFoundSubtitle}
        </p>
        <CtaButton
          as={Link}
          to="/"
          className="mt-6 px-6 py-3"
        >
          <ArrowLeft size={14} />
          {cms.pages.notFoundBack}
        </CtaButton>
      </motion.div>
    </div>
  );
}
