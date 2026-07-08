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
          className={`ds-confirm-scrim${position === "absolute" ? " ds-confirm-scrim--absolute" : ""}${brand ? " ds-confirm-scrim--brand" : ""}`}
          style={{ ["--ds-confirm-z" as any]: zIndex }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={`ds-confirm__card${brand ? " ds-confirm__card--brand" : ""}${size === "md" ? " ds-confirm__card--md" : ""}`}
            role="alertdialog"
            aria-modal="true"
            aria-label={ariaLabel}
          >
            <div
              className="ds-confirm__icon"
              style={{ ["--ds-confirm-tone" as any]: toneVar }}
            >
              {icon}
            </div>
            <div className="ds-confirm__head">
              <Heading
                level={brand ? "sm" : "xs"}
                color="var(--text-default)"
                className={brand ? "ds-confirm__title--brand" : undefined}
              >
                {title}
              </Heading>
              <p className={`${brand ? "type-body-lg" : "type-body"} ds-confirm__body`}>
                {body}
              </p>
            </div>
            <div className="ds-confirm__actions">
              {actions.map((action, i) => {
                const variant = action.variant ?? (i === 0 ? "cta" : "secondary");
                if (variant === "cta") {
                  return (
                    <CtaButton
                      key={i}
                      onClick={action.onClick}
                      className="ds-confirm__action-cta"
                    >
                      {action.label}
                    </CtaButton>
                  );
                }
                const actionModifierClass = {
                  primary: "ds-confirm__action--primary",
                  destructive: "ds-confirm__action--destructive",
                  secondary: "ds-confirm__action--secondary",
                }[variant as "primary" | "destructive" | "secondary"];
                return (
                  <button
                    key={i}
                    onClick={action.onClick}
                    className={`ds-confirm__action ${actionModifierClass}`}
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
