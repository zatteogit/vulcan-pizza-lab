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

const ACCENT: Record<NonNullable<SnackbarProps["variant"]>, string> = {
  default: "var(--primary)",
  success: "var(--text-success)",
  error: "var(--text-error)",
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
      className={className}
      role="status"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 16px 12px 20px",
        borderRadius: 14,
        background: "var(--text-default)",
        color: "var(--container-page)",
        boxShadow: "var(--shadow-lg)",
        maxWidth: 420,
        ...style,
      }}
    >
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--font-size-lg)", flex: 1 }}>
        {message}
      </span>
      {action && (
        <button
          type="button"
          onClick={onAction}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--weight-bold)" as CSSProperties["fontWeight"],
            color: ACCENT[variant],
            background: "none",
            border: "none",
            cursor: "pointer",
            outline: "none",
            whiteSpace: "nowrap",
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
