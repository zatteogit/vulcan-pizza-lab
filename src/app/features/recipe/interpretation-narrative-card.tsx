/* Card narrativa dell'interpretazione/firma attiva.
 *
 * Mostrata SOTTO la card match quando una firma è selezionata (es. "Metodo
 * Bonci" su Teglia Romana). Prima l'interpretazione viveva solo nel pannello
 * parametri; questa card la rende evidente con maestro, badge e storia
 * (richiesta owner lug 2026). */
import type { Interpretation } from "../../data/interpretation-library";

/** Nome primario dell'interpretazione (maestro › locale › ente › firma). */
function primaryName(it: Interpretation): string {
  return it.author ?? it.pizzeria ?? it.organization ?? it.signature_name ?? "Interpretazione";
}

/** Riga meta: locale · città · anno (solo i pezzi presenti). */
function metaLine(it: Interpretation): string {
  return [
    it.author && it.pizzeria ? it.pizzeria : null,
    it.location,
    it.year_codified ? String(it.year_codified) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function InterpretationNarrativeCard({ interpretation }: { interpretation: Interpretation }) {
  const it = interpretation;
  const meta = metaLine(it);
  return (
    <div
      className="rounded-2xl p-4 mt-3"
      style={{
        background: "var(--container-card)",
        border: "1px solid var(--container-border-ghost)",
      }}
    >
      <div className="flex items-start gap-3">
        {it.emoji && (
          <span aria-hidden style={{ fontSize: "var(--font-size-2xl)", lineHeight: 1 }}>
            {it.emoji}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              style={{
                color: "var(--text-default)",
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--weight-semibold)" as any,
              }}
            >
              {primaryName(it)}
            </span>
            {it.badge && (
              <span
                className="rounded-full px-2 py-0.5"
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--text-accent)",
                  background: "color-mix(in srgb, var(--text-accent) 10%, transparent)",
                }}
              >
                {it.badge}
              </span>
            )}
          </div>
          {meta && (
            <div
              className="mt-0.5"
              style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}
            >
              {meta}
            </div>
          )}
          {it.technique_signature && (
            <div
              className="mt-2"
              style={{ color: "var(--text-default)", fontSize: "var(--font-size-sm)", fontStyle: "italic" }}
            >
              {it.technique_signature}
            </div>
          )}
          <p
            className="mt-2"
            style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)", lineHeight: "var(--leading-normal)" }}
          >
            {it.story}
          </p>
          {it.url && (
            <a
              href={it.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-block"
              style={{
                color: "var(--text-accent)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--weight-semibold)" as any,
                textDecoration: "underline",
              }}
            >
              {it.author ?? it.pizzeria ?? "Approfondisci"} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
