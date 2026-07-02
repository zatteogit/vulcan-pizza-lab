/* === SUB-PAGE HEADER — barra sticky condivisa delle sotto-pagine ===
   UN SOLO pattern per glossario, troubleshooting e pre-fermenti (prima erano
   tre strutture diverse): back "‹ sezione" a sinistra, titolo opzionale al
   centro-sinistra, meta opzionale a destra. Il lato destro resta libero
   perché sopra ci fluttua il ProfileButton della shell. */

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import { Surface } from "../ds/index";

export function SubPageHeader({
  backTo,
  backLabel,
  icon,
  title,
  meta,
}: {
  backTo: string;
  backLabel: string;
  /** Icona accanto al titolo (16px, colore primary). */
  icon?: ReactNode;
  /** Titolo nella barra — solo per pagine SENZA hero nel contenuto. */
  title?: ReactNode;
  /** Slot destro (es. conteggio voci). Tenere compatto. */
  meta?: ReactNode;
}) {
  return (
    <Surface
      as="header"
      variant="glass"
      className="sticky top-0 z-40"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* pr-16: riserva la corsia del ProfileButton fisso della shell,
          che a viewport stretti tocca il bordo del contenitore. */}
      <div className="max-w-4xl mx-auto pl-4 pr-16 sm:pl-6 sm:pr-16 h-14 sm:h-16 flex items-center gap-3">
        <Link
          to={backTo}
          data-back-button="true"
          className="flex items-center gap-1 -ml-1 active:scale-95 transition-transform flex-shrink-0"
          style={{
            color: "var(--text-accent)",
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--weight-semibold)" as any,
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={18} />
          <span>{backLabel}</span>
        </Link>

        {title && (
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <span
                className="flex-shrink-0 inline-flex"
                style={{ color: "var(--primary)" }}
                aria-hidden="true"
              >
                {icon}
              </span>
            )}
            <span
              className="font-serif truncate"
              style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: "var(--weight-bold)" as any,
                color: "var(--text-default)",
              }}
            >
              {title}
            </span>
          </div>
        )}

        {meta && (
          <>
            <div className="flex-1" />
            <div className="flex items-center flex-shrink-0">{meta}</div>
          </>
        )}
      </div>
    </Surface>
  );
}
