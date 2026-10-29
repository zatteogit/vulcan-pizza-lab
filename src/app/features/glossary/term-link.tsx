/**
 * FW-04 — TermLink: un termine tecnico visibile (W, P/L, staglio, appretto…)
 * che si apre in un tocco. Il testo è sottolineato a puntini; il tocco apre
 * la definizione breve (InfoTip v2) con «Apri nel glossario» verso la voce
 * completa. Senza figli mostra il nome del termine nella lingua attiva.
 *
 * Non va dentro un altro elemento interattivo (link di una card, pulsante):
 * lì il termine si spiega con aria-describedby o fuori dalla card.
 * Il test term-link.test.ts verifica che ogni termId usato esista.
 */
import type { ReactNode } from "react";
import { InfoTip } from "../../components/shared/info-tip";
import { getTermById } from "../../data/glossary-data";
import { useCms } from "../cms/cms-context";

export function TermLink({ termId, children }: { termId: string; children?: ReactNode }) {
  const { cms } = useCms();
  const label = children ?? getTermById(termId, cms)?.name ?? termId;
  return <InfoTip termId={termId} triggerLabel={<span className="term-link">{label}</span>} />;
}

/** «Nel glossario: Staglio · Pirlatura» — le parole di un passo o di una scheda. */
export function GlossaryTermLinks({ termIds, className }: { termIds: readonly string[]; className?: string }) {
  const { cms } = useCms();
  if (termIds.length === 0) return null;
  return (
    <div className={["term-links", className].filter(Boolean).join(" ")} data-region="term-links">
      <span className="term-links__label">{cms.glossary.inGlossaryLabel}</span>
      {termIds.map((id) => <TermLink key={id} termId={id} />)}
    </div>
  );
}
