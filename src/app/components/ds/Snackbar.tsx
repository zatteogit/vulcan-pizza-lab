/**
 * ds/Snackbar — T4 notifica transitoria token-driven, context-free.
 *
 * Barra scura con messaggio + azione opzionale. Variante colora l'azione.
 * Estratto da SnackbarToastSpec.
 */
import type { CSSProperties, ReactNode } from "react";

export interface SnackbarProps {
  message: ReactNode;
  action?: string;
  onAction?: () => void;
  variant?: "default" | "success" | "error";
  className?: string;
  style?: CSSProperties;
}

const ACTION_CLASS: Record<NonNullable<SnackbarProps["variant"]>, string> = {
  default: "ds-snackbar__action",
  success: "ds-snackbar__action ds-snackbar__action--success",
  error: "ds-snackbar__action ds-snackbar__action--error",
};

export function Snackbar({
  message,
  action,
  onAction,
  variant = "default",
  className,
  style,
}: SnackbarProps) {
  return (
    <div
      className={["ds-snackbar", className].filter(Boolean).join(" ")}
      role="status"
      style={style}
    >
      <span className="ds-snackbar__message">{message}</span>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className={ACTION_CLASS[variant]}
        >
          {action}
        </button>
      )}
    </div>
  );
}
