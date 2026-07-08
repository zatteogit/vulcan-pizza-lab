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
      data-region="toolbar"
      className="sub-page-header"
    >
      {/* pr-16: riserva la corsia del ProfileButton fisso della shell,
          che a viewport stretti tocca il bordo del contenitore. */}
      <div className="sub-page-header__inner">
        <Link
          to={backTo}
          data-back-button="true"
          className="sub-page-header__back"
        >
          <ChevronLeft size={18} />
          <span data-slot="label">{backLabel}</span>
        </Link>

        {title && (
          <div className="sub-page-header__title-group">
            {icon && (
              <span
                className="sub-page-header__icon"
                aria-hidden="true"
              >
                {icon}
              </span>
            )}
            <span className="sub-page-header__title">
              {title}
            </span>
          </div>
        )}

        {meta && (
          <>
            <div className="sub-page-header__spacer" />
            <div className="sub-page-header__meta">{meta}</div>
          </>
        )}
      </div>
    </Surface>
  );
}
