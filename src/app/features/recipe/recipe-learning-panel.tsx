import { X, GraduationCap } from "lucide-react";
import type { PizzaStyle } from "../../domain/pizza-engine";
import { formatOrigin } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { ModalSheet } from "../../components/ds/index";

export function RecipeLearningPanel({
  open,
  style,
  familyName,
  onClose,
}: {
  open: boolean;
  style: PizzaStyle;
  familyName: string;
  onClose: () => void;
}) {
  const { cms } = useCms();
  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      ariaLabel={`Approfondimenti su ${style.name}`}
      size="lg"
      scrim="soft"
      surface="solid"
      entry="pop"
      panelClassName="overflow-hidden"
    >
            <div
              className="flex items-start gap-4 px-5 py-5 sm:px-6"
              style={{ borderBottom: "1px solid var(--container-border-subtle)" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="flex items-center gap-1.5"
                  style={{
                    color: "var(--text-accent)",
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--weight-semibold)" as any,
                    letterSpacing: "var(--tracking-spread)",
                    textTransform: "uppercase",
                  }}
                >
                  <GraduationCap size={16} />
                  <span>Approfondimento</span>
                </p>
                <h2
                  className="font-serif mt-1"
                  style={{
                    fontSize: "clamp(var(--font-size-4xl), 6vw, var(--font-size-6xl))",
                    lineHeight: "var(--leading-heading)",
                  }}
                >
                  {style.name}
                </h2>
                <p
                  className="mt-2"
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "var(--font-size-lg)",
                    lineHeight: "var(--leading-normal)",
                  }}
                >
                  {familyName} · {formatOrigin(style.origin)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
                style={{
                  width: 38,
                  height: 38,
                  background: "var(--container-bg-low)",
                  border: "1px solid var(--container-border)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
                aria-label={cms.ui.closeInsight}
              >
                <X size={17} />
              </button>
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <p
                style={{
                  fontSize: "var(--font-size-xl)",
                  lineHeight: "var(--leading-reading)",
                  color: "var(--text-default)",
                }}
              >
                {style.description}
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {style.key_characteristics.slice(0, 6).map((characteristic) => (
                  <div
                    key={characteristic}
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: "var(--container-bg-low)",
                      border: "1px solid var(--container-border-subtle)",
                      color: "var(--text-default)",
                      fontSize: "var(--font-size-lg)",
                      lineHeight: "var(--leading-normal)",
                    }}
                  >
                    {characteristic}
                  </div>
                ))}
              </div>
            </div>
    </ModalSheet>
  );
}
