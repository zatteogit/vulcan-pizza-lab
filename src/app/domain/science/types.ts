/* ═══ FW-01 — Registro della scienza: tipi ═══
 * Ogni affermazione tecnica dell'app è un dato: statuto (che cosa è), formula,
 * variabili, ipotesi del modello, fonti e incertezza. UI, glossario, pagina
 * «Metodo e fonti» e server MCP leggono dallo stesso registro
 * (src/app/data/science-notes.ts, src/app/data/science-sources.ts).
 *
 * Qui non c'è testo per l'utente: titolo, frase di livello 1, spiegazione di
 * livello 2 e testo delle ipotesi stanno nel CMS, sotto
 * `science.notes.<noteId>.{title,l1,l2}` e `science.assumptions.<assumptionId>`,
 * in tutte e 7 le lingue. Modulo puro: niente React, CMS o browser. */

/** Statuto epistemico (D-A): etichette «Esatto / Stima / Ipotesi / Scelta di Vulcan». */
export type EvidenceKind =
  /** Definizione o aritmetica: percentuali del panettiere, somme, conversioni. */
  | "exact"
  /** Modello empirico con incertezza: lievito, Q10, Aw, W per tipo di farina. */
  | "estimate"
  /** Assunzione del modello: cucina a 21 °C, farina a temperatura ambiente. */
  | "assumption"
  /** Convenzione di prodotto: pesi del punteggio, tetto di non fattibilità. */
  | "editorial";

/** Stato di una fonte, 1:1 con docs/fonti-dati.md (V/P/D/errato). */
export type SourceStatus =
  /** V: fonte affidabile letta che riporta il valore. */
  | "verified"
  /** P: valore coerente con le fonti, ma nessuna lo riporta così. */
  | "plausible"
  /** D: nessuna fonte citabile letta. Mai mostrato come fatto al livello 1. */
  | "unverified"
  /** Una fonte lo contraddice. Una nota non può citarla a sostegno. */
  | "wrong";

export interface SourceRef {
  /** Id stabile kebab-case (`masaf-stg-2010`, `avpn-2024`…). */
  id: string;
  /** Titolo come in docs/fonti-dati.md (non tradotto: è un riferimento bibliografico). */
  title: string;
  author?: string;
  year?: number;
  url?: string;
  /** Data di lettura, ISO `YYYY-MM-DD`. Assente = non letta da noi. */
  accessed?: string;
  status: SourceStatus;
}

/** Unità di una variabile: chiave da formattare con il modulo di formato locale. */
export type ScienceUnitKey =
  | "percent"
  | "hours"
  | "minutes"
  | "seconds"
  | "celsius"
  | "grams"
  | "ratio"
  | "w-alveograph"
  | "g-per-cm2"
  | "w-per-m-k"
  | "kilojoule"
  | "index-100"
  | "dimensionless";

export interface ScienceVariable {
  /** Simbolo come compare nella formula (unicode, niente LaTeX). */
  symbol: string;
  unitKey: ScienceUnitKey;
}

export interface ScienceUncertainty {
  /** Incertezza relativa (0,2 = ±20 %), quando il modello ne dichiara una. */
  relative?: number;
  /** Intervallo plausibile nell'unità del valore mostrato. */
  range?: [number, number];
  /** Decimali massimi mostrabili: una stima non mostra più cifre di quante ne regge. */
  displayDecimals: number;
}

export interface ScienceNote {
  /** Id stabile kebab-case: è anche l'ancora della pagina «Metodo e fonti». */
  id: string;
  kind: EvidenceKind;
  /** Formula in simboli unicode, senza LaTeX. Non tradotta. */
  formula?: string;
  variables?: ScienceVariable[];
  /** Ipotesi del modello: testi in CMS `science.assumptions.<id>`. */
  assumptionIds?: string[];
  /** Fonti a sostegno (id di science-sources). */
  sourceIds: string[];
  uncertainty?: ScienceUncertainty;
  /** Nome della costante o funzione del motore che la nota descrive. */
  engineRef?: string;
  /** Voce di glossario collegata, se esiste. */
  glossaryTermId?: string;
}
