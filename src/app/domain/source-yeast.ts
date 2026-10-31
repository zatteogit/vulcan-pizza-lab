/* ═══ Tranche B1 (M1, D-068) · lievito della fonte ═══
 * Le ricette d'autore fatte in giornata usano molto più lievito di quanto il
 * modello di fermentazione (0,1 % di fresco per 24 h a 18 °C) calcoli per le
 * stesse ore: Benedetta Rossi 1,4 % di secco in circa 2 h, dove il modello
 * darebbe 0,09–0,12 % (docs/progetto-catalogo-italiano.md §9.3). È una scelta
 * degli autori, non un errore; con la dose del modello i tempi della fonte non
 * tornano. Una versione d'autore può quindi dichiarare tipo e dose del lievito
 * della sua fonte, e il motore li usa al posto della dose del modello.
 *
 * Il modo meno invasivo (D-068): nel motore ore e temperatura sono un dato
 * d'ingresso e la dose un risultato; timeline, fasi e punteggi del tempo non
 * dipendono dalla dose. Si sostituisce quindi solo la dose, e solo finché ore e
 * temperatura sono quelle della fonte: se l'utente le cambia torna la dose del
 * modello, perché con tempi diversi la dose della fonte non ha più riscontro.
 * Sulla dose della fonte non si applica la correzione personale («la mia
 * cucina lievita più veloce»): è scritta dall'autore, non stimata.
 * D-070 (decisione 3 di Matteo, 31/10/2026, estensione di D-068): la dose
 * vale anche solo col pre-fermento della fonte. Se l'utente lo toglie, lo
 * aggiunge o ne cambia tipo o quota, torna la dose del modello (il motore
 * confronta il pre-fermento della ricetta con quello della versione).
 *
 * Dispensa (decisione 6 di Matteo, 30/10/2026): tipo e dose come scritti; se
 * in dispensa manca quel tipo e c'è l'altro lievito di birra, si converte col
 * rapporto del motore (YEAST_DRY_RATIO: il secco è un terzo del fresco) e la
 * ricetta lo dichiara. Il lievito madre non sostituisce il lievito di birra di
 * una fonte (nessuna conversione ha una fonte): resta il tipo della fonte e la
 * ricetta chiede di procurarlo, come per ogni lievito che manca.
 * Modulo puro. */
import { YEAST_DRY_RATIO } from "./fermentation-model";

export type CommercialYeast = "fresh" | "dry";

/** Lievito scritto da una fonte, con i tempi per cui la fonte lo scrive. */
export interface SourceYeast {
  type: CommercialYeast;
  /** % sulla farina (percentuale del panettiere), come la fonte. */
  pct: number;
  /** Ore e temperatura della fonte: la dose vale solo con queste. */
  hours: number;
  temp_c: number;
  /** D-070: la fonte ha un pre-fermento (quello della versione, col suo tipo
   *  e la sua quota): la dose vale solo con quello, o solo senza se è false.
   *  Assente = non si controlla (chiamate dirette al motore). */
  pre_ferment?: boolean;
}

/** La dose della fonte come entra nella ricetta. */
export interface SourceYeastUse {
  /** Tipo e dose scritti dalla fonte. */
  source_type: CommercialYeast;
  source_pct: number;
  /** Tipo e dose della ricetta: diversi dalla fonte solo se `converted`. */
  type: CommercialYeast;
  pct: number;
  /** Convertito col rapporto del motore: in dispensa manca il tipo della fonte. */
  converted: boolean;
}

/** Conversione fra lievito fresco e secco col rapporto del motore (1:3). */
export function convertYeastPct(pct: number, from: CommercialYeast, to: CommercialYeast): number {
  if (from === to) return pct;
  return from === "fresh" ? pct * YEAST_DRY_RATIO : pct / YEAST_DRY_RATIO;
}

/** La fonte vale con i suoi tempi: stesse ore (entro un minuto) e stessa
 *  temperatura. */
export function sourceYeastMatches(source: SourceYeast, hours: number, tempC: number): boolean {
  return Math.abs(source.hours - hours) < 1 / 60 && Math.abs(source.temp_c - tempC) < 1e-6;
}

/** Tipo e dose del lievito della fonte per questa dispensa, oppure null se ore
 *  o temperatura non sono quelle della fonte (allora vale il modello).
 *  `pantryYeasts` è la dispensa già senza i lieviti esclusi; vuota = non
 *  detta, e allora conta solo l'esclusione. */
export function sourceYeastUse(
  source: SourceYeast,
  pantryYeasts: readonly string[],
  excludedYeasts: readonly string[],
  hours: number,
  tempC: number,
): SourceYeastUse | null {
  if (!sourceYeastMatches(source, hours, tempC)) return null;
  const available = (type: CommercialYeast) =>
    pantryYeasts.length === 0 ? !excludedYeasts.includes(type) : pantryYeasts.includes(type);
  const other: CommercialYeast = source.type === "fresh" ? "dry" : "fresh";
  const type = !available(source.type) && available(other) ? other : source.type;
  return {
    source_type: source.type,
    source_pct: source.pct,
    type,
    pct: convertYeastPct(source.pct, source.type, type),
    converted: type !== source.type,
  };
}
