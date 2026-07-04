/**
 * ds/ConfirmDialog — T4 conferma modale con icona, titolo, corpo e azioni impilate.
 *
 * UN SOLO pattern per tutte le conferme dell'app (sostituisce gli alertdialog
 * scritti a mano in recipe-output e cooking-mode). Scrim con blur soffice,
 * card `--radius-3xl`, icon-box tonale 56px, azioni full-width una sotto
 * l'altra (la primaria sopra).
 *
 * `emphasis="brand"` accende la variante "momento di marca" (gradiente caldo
 * e glow primario) usata per il dialog pre-cottura.
 */
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { CtaButton } from "./CtaButton";
import { Heading } from "./Heading";

type ConfirmDialogTone = "primary" | "destructive";

export interface ConfirmDialogAction {
  label: ReactNode;
  onClick: () => void;
  /** cta = verde CtaButton · primary = terracotta pieno · destructive = rosso pieno · secondary = neutro */
  variant?: "cta" | "primary" | "destructive" | "secondary";
}

export interface ConfirmDialogProps {
  open: boolean;
  /** Click sullo scrim (e SOLO sullo scrim): chiusura soft. */
  onDismiss: () => void;
  ariaLabel: string;
  icon: ReactNode;
  tone?: ConfirmDialogTone;
  title: ReactNode;
  body: ReactNode;
  actions: ConfirmDialogAction[];
  /** brand = card con gradiente caldo + glow (momenti di marca). */
  emphasis?: "plain" | "brand";
  /** fixed = viewport · absolute = dentro un contenitore `relative` (overlay cooking). */
  position?: "fixed" | "absolute";
  zIndex?: number;
  /** Larghezza card: sm = max-w-sm · md = max-w-md. */
  size?: "sm" | "md";
}

const ACTION_BASE =
  "w-full h-12 rounded-full active:scale-98 transition-transform flex items-center justify-center gap-2";

export function ConfirmDialog({
  open,
  onDismiss,
  ariaLabel,
  icon,
  tone = "primary",
  title,
  body,
  actions,
  emphasis = "plain",
  position = "fixed",
  zIndex = 210,
  size = "sm",
}: ConfirmDialogProps) {
  const toneVar = tone === "destructive" ? "var(--destructive)" : "var(--primary)";
  const brand = emphasis === "brand";
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${position === "fixed" ? "fixed" : "absolute"} inset-0 flex items-end sm:items-center justify-center p-4`}
          style={{
            zIndex,
            background: `color-mix(in srgb, var(--container-page) ${brand ? 72 : 70}%, transparent)`,
            backdropFilter: brand ? "blur(6px)" : "blur(4px)",
          }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${size === "md" ? "max-w-md" : "max-w-sm"} flex flex-col items-center text-center gap-4 p-6`}
            style={{
              borderRadius: "var(--radius-3xl)",
              background: brand
                ? "linear-gradient(145deg, color-mix(in srgb, var(--container-page) 92%, transparent), color-mix(in srgb, var(--recipe-hero-badge-bg) 38%, var(--container-page)))"
                : "var(--container-page)",
              border: brand
                ? "1px solid color-mix(in srgb, var(--primary) 24%, var(--container-border))"
                : "1px solid var(--container-border)",
              boxShadow: brand
                ? "0 24px 70px color-mix(in srgb, var(--shadow-color) 26%, transparent), 0 0 48px color-mix(in srgb, var(--primary) 16%, transparent)"
                : "0 24px 60px color-mix(in srgb, var(--shadow-color) 28%, transparent)",
            }}
            role="alertdialog"
            aria-modal="true"
            aria-label={ariaLabel}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius-xl)",
                background: `color-mix(in srgb, ${toneVar} 12%, transparent)`,
                color: toneVar,
              }}
            >
              {icon}
            </div>
            <div className="flex flex-col gap-1.5">
              <Heading level={brand ? "sm" : "xs"} color="var(--text-default)" style={brand ? { lineHeight: 1.15 } : undefined}>
                {title}
              </Heading>
              <p className={brand ? "type-body-lg" : "type-body"} style={{ color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                {body}
              </p>
            </div>
            <div className="flex flex-col w-full gap-2.5 mt-1">
              {actions.map((action, i) => {
                const variant = action.variant ?? (i === 0 ? "cta" : "secondary");
                if (variant === "cta") {
                  return (
                    <CtaButton
                      key={i}
                      onClick={action.onClick}
                      className="w-full h-12 active:scale-98"
                      style={{ fontSize: "var(--font-size-lg)" }}
                    >
                      {action.label}
                    </CtaButton>
                  );
                }
                return (
                  <button
                    key={i}
                    onClick={action.onClick}
                    className={ACTION_BASE}
                    style={{
                      fontSize: "var(--font-size-lg)",
                      fontWeight: "var(--weight-semibold)" as any,
                      cursor: "pointer",
                      ...(variant === "primary"
                        ? {
                            background: "var(--primary)",
                            color: "var(--text-on-accent)",
                            border: "1px solid var(--primary)",
                            boxShadow: "0 12px 28px color-mix(in srgb, var(--primary) 24%, transparent)",
                          }
                        : variant === "destructive"
                          ? {
                              background: "var(--destructive)",
                              color: "var(--overlay-text)",
                              border: "none",
                            }
                          : {
                              background: "var(--container-bg)",
                              color: "var(--text-default)",
                              border: "1px solid var(--container-border)",
                            }),
                    }}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
