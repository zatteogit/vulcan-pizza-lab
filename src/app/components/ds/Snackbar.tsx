/**
 * ds/Snackbar — T4 notifica transitoria token-driven, context-free.
 *
 * Barra scura con messaggio + azione opzionale. Variante colora l'azione.
 * G5-WP-05 (S17-B-15): la variante error non si confonde con un successo:
 * fondo di stato bloccante, icona e role="alert" (lo legge subito).
 * Estratto da SnackbarToastSpec.
 */
import type { CSSProperties, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

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
  const error = variant === "error";
  return (
    <div
      className={["ds-snackbar", error ? "ds-snackbar--error" : null, className].filter(Boolean).join(" ")}
      role={error ? "alert" : "status"}
      style={style}
    >
      {error && <AlertCircle size={18} aria-hidden="true" className="ds-snackbar__icon" />}
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
