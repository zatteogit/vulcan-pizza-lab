import type { CmsContent, LocaleId } from "../cms-context";
import { registerUiMessages } from "../../../i18n/ui-messages";

/* ═══ LOCALE REGISTRY ═══
 * Each locale is a full CmsContent bundle, loaded ON DEMAND (audit lug 2026:
 * i 6 bundle non-IT pesavano ~440 kB di sorgente nel chunk principale — un
 * utente italiano scaricava anche il giapponese a ogni avvio). Dal 30/10/2026
 * (budget D-059) anche l'italiano: chi usa un'altra lingua non lo scarica, e
 * ogni bundle basta a sé stesso (locale-parity.test.ts). main.tsx carica il
 * bundle della lingua di avvio prima del primo render, e lo script in <head>
 * (vite.config.ts, localePreloadPlugin) lo precarica insieme al chunk
 * d'ingresso: la scelta della lingua sta in bootLocaleId() e lì va tenuta
 * allineata.
 * To add a new language:
 *   1. Create a new file (e.g. ja.ts) exporting JA_LOCALE: CmsContent
 *   2. Add its loader here and its entry in LOCALE_META
 *   3. The CMS language selector will auto-detect the new entry
 */

const LOCALE_LOADERS: Record<LocaleId, () => Promise<CmsContent>> = {
  it: () => import("./it").then((m) => m.IT_LOCALE),
  en: () => import("./en").then((m) => m.EN_LOCALE),
  es: () => import("./es").then((m) => m.ES_LOCALE),
  de: () => import("./de").then((m) => m.DE_LOCALE),
  fr: () => import("./fr").then((m) => m.FR_LOCALE),
  pt: () => import("./pt").then((m) => m.PT_LOCALE),
  ja: () => import("./ja").then((m) => m.JA_LOCALE),
};

/* ═══ REVISIONE DEI BUNDLE ═══
 * Chi usa una lingua non italiana tiene in localStorage uno snapshot dell'intero
 * bundle (evita il lampo dell'italiano al boot) e lo snapshot prevale sui
 * default. Quando i testi dei bundle cambiano in modo che gli snapshot già
 * salvati vadano sostituiti, si incrementa LOCALE_BUNDLE_REV: al primo avvio
 * il CmsProvider ricarica il bundle corrente (si perdono le modifiche CMS locali
 * in quella lingua, come già succede cambiando lingua).
 *   1 → token {brand}/{brandFull} al posto del nome scritto per esteso.
 *   2 → catalogo uiMessage, condimenti tradotti (toppingI18n), testi
 *       corretti con le fonti (C-4) e «Ispirazione» al posto di «Signature».
 *   3 → testi dei 15 stili che mancavano (I18N-4), ispirazioni e ricette
 *       iconiche corrette e tradotte (inspirationI18n, I18N-5).
 *   4 → primo avvio sul forno (D-038), niente emoji nei testi (U-8),
 *       titoli con la sola iniziale maiuscola (INT-D5).
 *   5 → pre-fermento e temperatura dell'acqua riscritti (audit totale n. 3-4).
 *   6 → fattibilità/autenticità, Su misura, dispensa progressiva, livelli,
 *       CTA Crea, tooltip del voto e distinzione del riferimento STG.
 *  10 → azione esplicita «Ripristina originale» nelle sette lingue.
 *  11 → diete su impasto e condimento, versioni alternative e range del metodo.
 *  12 → azione «Apri in Crea» distinta dalla personalizzazione rapida.
 *  15 → troubleshooting contestuale, frittura e descrizioni senza conteggi fissi.
 *  18 → fasi di frittura e Baciata, istruzioni della farcitura per stile.
 *  19 → FW-01: testi del registro della scienza, thickness factor, prefermenti
 *       senza dati «da verificare» mostrati come fatti, caratteristiche senza
 *       promesse di salute.
 *  20 → FW-20: avviso del forno in Crea (D-038) e sottotitolo degli stili
 *       senza «filtri in alto».
 *  21 → FW-16: effetto delle impostazioni, diete, feedback e promemoria onesti
 *       (e lessico controllato di FW-14).
 *  22 → FW-11: testi dei parametri tecnici e luoghi d'origine per lingua;
 *       FW-07: forno elettrico e a gas «impostato a».
 *  23 → FW-14 (revisione): «Riferimento» al posto di «Originale» nei testi
 *       della ricetta di riferimento.
 *  24 → FW-05: glossario, problemi e prefermenti con i fatti del motore
 *       (segnaposto), scala unica della farina, sale della STG.
 *  25 → FW-15: sottotitolo di Impara e descrizione del glossario.
 *  26 → FW-17 (+ revisione): biga/poolish col lievito madre (D-P), staglio
 *       «in questo passo» invece di «sotto in Ingredienti», Regola 55 a
 *       quattro termini col prefermento (rule55DescriptionPreferment).
 *  27 → FW-19: piano temporale unico (pieghe come passo, recupero del forno
 *       fra le cotture, Timeline comoda onesta, niente «contabilità del tempo»;
 *       pieghe in cantina senza frigo, timer di cottura per variante).
 *  28 → FW-02: nota della scienza «stg-reference» e ipotesi «stg-partial-check».
 *  29 → revisione ondata 2: formule della scienza e note delle fonti nella
 *       lingua (science.formulas, science.sourceNotes), tedesco sempre «du».
 *  30 → D-060 (main): la forza della farina come intervallo («W 260–310»).
 *  31 → FW-06: punteggio spiegabile, pesi D-E presi dal motore, tetto di
 *       autenticità detto come regola.
 *  32 → FW-04: voci del glossario per il procedimento e le farine, definizioni
 *       semplici, formule tradotte, «Valori tipici»/«Perché conta», tabelle
 *       con il valore nella prima colonna, «Carico d'impasto», TermLink.
 *  33 → integrazione ondata 2: FW-04 + D-062/D-063 (nota «ranking-tiebreak»,
 *       tetto del combustibile solo sotto il minimo) e unione dei due tagli
 *       dei testi che nessuna pagina legge.
 *  35 → (main) pill delle card su una riga: copy corti (card.*,
 *       diet.cardConflict, allergen.cardTrace/cardOptional) e card.exclusionsCheck.
 *  36 → G5-WP-04: «Altre farine» senza integrali, via «Macinata a pietra»,
 *       «gancio impastatore» al posto di «gancio K».
 *  37 → G5-WP-06: «Riconfigura la cucina» col dialog del DS (titolo, azione,
 *       testo che dice che ricette e preferiti restano).
 *  38 → G5-WP-02: «Passo N di M», riepilogo modificabile nel congedo
 *       (ftuSummary*), tolte le card del congedo e «Benvenuto».
 *  39 → G5-WP-03: descrizione generica dei forni (ovenPresets.*.hint).
 *  40 → G5-WP-05: condividi/rinomina dal ricettario, errori di copia e
 *       rinomina, conferma dell'esportazione, preferito tolto con «Annulla».
 *  41 → D-065: sette condimenti quotidiani (toppingI18n) nelle sei lingue.
 *  42 → integrazione G2 (ondata 3): nota «linked-params» e la sua formula
 *       (G2-WP-01), sections.when.title (G2-WP-05), tempCool con la parola
 *       e tolti hint*Ferment*, adjustByHand, changeTiming (G2-WP-02).
 *  43 → integrazione G3 (ondata 3): WP-02 tolto cooking.savedVersion (unico interruttore il
 *       segnalibro, con «Annulla»); WP-03 timeline.mix.hands.descHighHydration,
 *       timeline.topping.basilThreshold, tipNerd con {pct}, bulk.longDesc;
 *       WP-05 passi del procedimento all'imperativo.
 *  44 → integrazione G4 (ondata 3), voci del ramo G4:
 *     37 → G4a-WP-02: tolto cooking.minimizeHint (il «riduci» dell'header non
 *     ha più title=; resta l'aria-label cooking.minimize).
 *     40 → G4b-WP-02: passi «Come si fa» e esempio su 1 kg nella guida ai
 *     prefermenti (preFerment.steps, stepsLabel, example*), nota
 *     pre-ferment-procedure.
 *     41 → G4b-WP-03: problemi P22–P24 (pala, panetto che si allarga, buchi in
 *     stesura), nota troubleshooting-practice, tolta la categoria «solver».
 *  45 → P24 «Si apre un buco» unito a P02 (stesura), nelle sei lingue.
 *  46 → G1b-WP-01: «Versioni d'autore» al posto di «Tecniche d'autore
 *       compatibili», più sheetTechniqueFrom/Generate/Source.
 *  47 → D-065 A2: Sardenaira De.Co. senza cipolla, sfincione bianco di
 *       Bagheria con la ricotta (toppingI18n) nelle sei lingue.
 *  48 → G1b, seguito: recipe.referenceLabel.authorAdapt (la versione d’autore
 *       si adatta con l’azione della match card e diventa «Su misura»).
 *  49 → G1a-WP-01: note delle farine nel CMS (flours.<id>.note), tradotte e
 *       senza i numeri che la scheda farina mostra già.
 *  50 → G1a-WP-02: gruppo «Forni» della ricerca (pages.searchCatOvens).
 *  51 → G1a-WP-03: nome del pulsante Profilo («Profilo e cucina», navProfileKitchen).
 *  52 → chiavi uiMessage generate senza lo slug del testo (namespace + hash).
 *  53 → FW-10, seguito: «Cambia forno» nell'avviso «Così non è fattibile»
 *       quando la causa è il forno (verdict.changeOven).
 *  54 → D-065 tranche A2: nove condimenti (toppingI18n) nelle sei lingue.
 * Rinominare il prodotto NON richiede un incremento: gli snapshot salvati da
 * questa revisione in poi contengono i token, non il nome. */
export const LOCALE_BUNDLE_REV = 54;

/* 52 resta: l'italiano diventa un bundle lazy (30/10/2026) ma la forma dei
 * bundle e degli snapshot salvati non cambia; l'italiano non ha snapshot. */

/** True se lo snapshot salvato è di una lingua non italiana e di una revisione
 *  diversa da quella corrente (gli snapshot senza revisione sono precedenti). */
export function isStaleLocaleSnapshot(
  overrides: Partial<CmsContent> | null,
  savedRev: number | null,
): boolean {
  const localeId = overrides?.locale?.id;
  if (!localeId || localeId === "it") return false;
  return savedRev !== LOCALE_BUNDLE_REV;
}

/** Bundle già caricati in sessione — lettura sincrona per il merge base. */
const loadedBundles: Partial<Record<LocaleId, CmsContent>> = {};

export function isKnownLocale(code: string): code is LocaleId {
  return Object.prototype.hasOwnProperty.call(LOCALE_LOADERS, code);
}

export function getCachedLocaleBundle(id: LocaleId): CmsContent | undefined {
  return loadedBundles[id];
}

/** Un bundle già in cache, l'italiano se c'è: la base finché arriva quello
 *  della lingua chiesta (c'è sempre almeno il bundle di avvio). */
export function getAnyCachedLocaleBundle(): CmsContent | undefined {
  return loadedBundles.it ?? Object.values(loadedBundles)[0];
}

/** Mette in cache un bundle già importato, con il suo catalogo uiMessage,
 *  per chi rende componenti senza CmsProvider né main.tsx: il setup dei test
 *  e il bundle del design system (components/ds/_sync-entry.ts). */
export function primeLocaleBundle(bundle: CmsContent): void {
  loadedBundles[bundle.locale.id] = bundle;
  registerUiMessages(bundle.locale.id, bundle.messages);
}

export async function loadLocaleBundle(
  id: LocaleId,
): Promise<CmsContent | undefined> {
  const cached = loadedBundles[id];
  if (cached) return cached;
  const loader = LOCALE_LOADERS[id];
  if (!loader) return undefined;
  const bundle = await loader();
  loadedBundles[id] = bundle;
  return bundle;
}

/* ═══ LINGUA DI AVVIO ═══
 * Stato del CMS salvato nel browser: lo snapshot del bundle per le lingue
 * straniere, le sole modifiche per l'italiano. Chiave tecnica: il prefisso
 * vulcan_ resta. */
export const CMS_STORAGE_KEY = "vulcan_cms";

/* Lo snapshot letto da bootLocaleId() serve subito dopo al provider: lo si
   tiene per una lettura, invece di analizzare due volte centinaia di kB. */
let savedAtBoot: { value: Partial<CmsContent> | null } | null = null;

export function readSavedCms(): Partial<CmsContent> | null {
  if (savedAtBoot) {
    const { value } = savedAtBoot;
    savedAtBoot = null;
    return value;
  }
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    }
  } catch { /* storage restricted */ }
  return null;
}

/** Detect best locale from browser language, with fallback to English (not Italian).
 * Returns null if Italian is detected (since Italian is the default). */
export function detectBrowserLocale(): LocaleId | null {
  try {
    const langs = navigator.languages ?? [navigator.language];
    for (const lang of langs) {
      const code = lang.split("-")[0].toLowerCase();
      if (code === "it") return null; /* Italian = default, no override needed */
      if (isKnownLocale(code)) return code;
    }
    /* No match found — fallback to English */
    return "en";
  } catch {
    return "en";
  }
}

/** La lingua con cui parte l'app: quella dello stato salvato (senza lingua =
 *  italiano con modifiche), altrimenti quella del browser. Lo script di
 *  precaricamento in <head> ripete questa regola. */
export function bootLocaleId(): LocaleId {
  savedAtBoot = null;
  const saved = readSavedCms();
  savedAtBoot = { value: saved };
  if (saved) {
    const id = saved.locale?.id;
    return id && isKnownLocale(id) ? id : "it";
  }
  return detectBrowserLocale() ?? "it";
}

/** Metadata for the locale selector UI */
export interface LocaleMeta {
  id: LocaleId;
  name: string;
  flag: string;
  available: boolean;
}

export const LOCALE_META: LocaleMeta[] = [
  {
    id: "it",
    name: "Italiano",
    flag: "\u{1F1EE}\u{1F1F9}",
    available: true,
  },
  {
    id: "en",
    name: "English",
    flag: "\u{1F1EC}\u{1F1E7}",
    available: true,
  },
  {
    id: "es",
    name: "Espa\u00F1ol",
    flag: "\u{1F1EA}\u{1F1F8}",
    available: true,
  },
  {
    id: "de",
    name: "Deutsch",
    flag: "\u{1F1E9}\u{1F1EA}",
    available: true,
  },
  {
    id: "fr",
    name: "Fran\u00E7ais",
    flag: "\u{1F1EB}\u{1F1F7}",
    available: true,
  },
  {
    id: "pt",
    name: "Portugu\u00EAs",
    flag: "\u{1F1F5}\u{1F1F9}",
    available: true,
  },
  {
    id: "ja",
    name: "\u65E5\u672C\u8A9E",
    flag: "\u{1F1EF}\u{1F1F5}",
    available: true,
  },
];

/** BCP 47 locale tag for Intl APIs */
export const LOCALE_BCP47: Record<LocaleId, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
  pt: "pt-BR",
  ja: "ja-JP",
};
