import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDebugGate } from "./debug/use-debug-gate";

/* The interactive workspace (pins, canvas, form, panel, sync) is a separate
   chunk pulled in only when the debugger is switched on, so users who never
   open it don't download or run any of it. */
const DebugWorkspace = lazy(() =>
  import("./debug/debug-workspace").then((m) => ({ default: m.DebugWorkspace })),
);

function DebugToast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className="fixed top-6 left-1/2 z-[100001] px-4 py-2 rounded-full border shadow-lg text-xs font-semibold vulcan-debug-exclude"
          style={{
            background: "var(--premium-glass-bg)",
            borderColor: "var(--premium-glass-border)",
            color: "var(--text-default)",
            boxShadow: "var(--premium-glass-shadow)",
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Always-mounted gate for the AI debug overlay. Keeps the footprint to a single
 * toggle hook + toast until the user activates it, then lazy-loads the full
 * workspace.
 */
export function DebugOverlay() {
  const { isEnabled, showToast, toast } = useDebugGate();

  return (
    <>
      <DebugToast message={toast} />
      {isEnabled && (
        <Suspense fallback={null}>
          <DebugWorkspace showToast={showToast} />
        </Suspense>
      )}
    </>
  );
}
