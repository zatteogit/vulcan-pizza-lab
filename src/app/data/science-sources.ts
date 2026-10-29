import type { SourceRef } from "../domain/science/types";

/* ═══ FW-01 — Registro delle fonti ═══
 * Trascrizione operativa di docs/fonti-dati.md §Riferimenti,
 * docs/ricerca/prefermenti-fonti-2026-10-24.md e
 * docs/ricerca/forni-fonti-2026-10-24.md. I documenti restano la ricerca
 * (con le note «Fatto / Lettura / Ipotesi»); qui ci sono id stabili e stato,
 * che le note del registro (science-notes.ts) citano.
 *
 * Stati: verified = V, plausible = P, unverified = D (o fonte non letta da noi),
 * wrong = una fonte che non sostiene ciò per cui era citata. `accessed` assente
 * vuol dire che la fonte non è stata riletta: va verificata prima di usarla
 * come sostegno di un fatto.
 *
 * Il titolo è quello bibliografico, nella lingua originale, e non si traduce.
 * Ciò che lo descrive («scheda del produttore», «letto solo l'abstract»,
 * «non pubblico») è una `noteKey`, tradotta nel CMS in 7 lingue
 * (`science.sourceNotes.<noteKey>`): niente glosse in italiano nei titoli e
 * niente percorsi del repository (test in science-registry.test.ts). */

const READ_2026_10_24 = "2026-10-24";

export const SCIENCE_SOURCES: readonly SourceRef[] = [
  /* ── Disciplinari e norme ── */
  { id: "masaf-stg-2010", title: "Regolamento (UE) n. 97/2010 — «Pizza Napoletana» STG (disciplinare)", author: "Commissione europea", year: 2010, url: "https://www.boe.es/doue/2010/034/L00007-00016.pdf", accessed: READ_2026_10_24, status: "verified" },
  { id: "avpn-2024", title: "AVPN, International Regulations «Verace Pizza Napoletana» (Il Disciplinare)", author: "Associazione Verace Pizza Napoletana", year: 2024, url: "https://www.pizzanapoletana.org/public/pdf/Disciplinare-2024-ENG.pdf", accessed: READ_2026_10_24, status: "verified" },
  { id: "opr-2020", title: "Associazione Originale Pinsa Romana, Regolamento e Protocollo", year: 2020, url: "https://www.pinsaromana.org/wp-content/uploads/2022/10/Regolamento-e-Protocollo.pdf", accessed: READ_2026_10_24, status: "verified" },
  { id: "ue-recco-2015", title: "Regolamento di esecuzione (UE) 2015/39 — «Focaccia di Recco col formaggio» IGP", author: "Commissione europea", year: 2015, url: "https://www.boe.es/doue/2015/008/L00007-00009.pdf", accessed: READ_2026_10_24, status: "verified" },
  { id: "cciaa-genova-2024", title: "Disciplinare IGP «Focaccia di Recco col formaggio»", author: "Camera di Commercio di Genova", year: 2024, url: "https://www.ge.camcom.gov.it/it/promuovi/prodotti-tipici/prodotti-dop-e-igp/disciplinare_focaccia_di_recco_settembre_2024.pdf", accessed: READ_2026_10_24, status: "verified" },
  { id: "masaf-pat-2026", title: "MASAF, 26ª revisione dell'elenco dei prodotti agroalimentari tradizionali", year: 2026, url: "https://www.masaf.gov.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/24151", accessed: READ_2026_10_24, status: "verified" },
  /* Citata dall'audit del 28/10/2026 per «00/0/1 = abburattamento, non forza»: testo non riletto. */
  { id: "dpr-187-2001", title: "D.P.R. 9 febbraio 2001, n. 187 — sfarinati e paste alimentari", year: 2001, status: "unverified" },

  /* ── Pinsa, fritta, New Haven, Starita ── */
  { id: "pinsaromana-it-2022", title: "Come fare la Pinsa Romana: metodo originale con Marco Montuori", author: "PinsaRomana.it", year: 2022, url: "https://pinsaromana.it/ricetta/come-fare-la-pinsa-romana-metodo-originale-con-marco-montuori/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "di-marco-2026", title: "Di Marco, «Cuocila!» e «La Pinsa: cos'è»", year: 2026, url: "https://www.pinsadimarco.com/la-pinsa-cose/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "pinsaromana-info", title: "Pinsa Romana: informazioni", author: "L. Bucciarelli", url: "https://www.pinsaromana.info/pinsa-romana-informazioni/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "pmq-2019", title: "The mystique and magic of New Haven-style pizza", author: "B. DeJournett, PMQ Pizza Magazine", year: 2019, url: "https://www.pmq.com/the-mystique-and-magic-of-new-haven-style-pizza/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "amodio-2025", title: "Battilocchio e Piscitiello a Napoli", author: "A. Amodio", year: 2025, url: "https://www.lucianopignataro.it/a/battilocchio-e-piscitiello-a-napoli-gli-indirizzi-giusti-per-la-pizza-fritta-lunga-e-sottile/270698/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "pignataro-2025", title: "Il Battilocchio della Masardona spiegato da Enzo Piccirillo", author: "L. Pignataro", year: 2025, url: "https://www.lucianopignataro.it/a/il-battilocchio-della-masardona-spiegato-da-enzo-piccirillo/278585/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "becchi-2023", title: "Where to eat the best pizza fritta in Naples", author: "M. Becchi, Gambero Rosso International", year: 2023, url: "https://gamberorossointernational.com/?p=481956", accessed: READ_2026_10_24, status: "plausible" },
  { id: "clemente-2016", title: "Napoli: le 10 pizze fritte napoletane migliori", author: "N. Clemente, Dissapore", year: 2016, url: "https://www.dissapore.com/cibo-di-strada/napoli-le-10-pizze-fritte-migliori/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "scatti-di-gusto-2016", title: "Ricetta della montanara fritta di Gino Sorbillo", author: "Scatti di Gusto", year: 2016, url: "https://www.scattidigusto.it/ricetta-pizza-a-casa-montanara-fritta", accessed: READ_2026_10_24, status: "plausible" },
  { id: "pagano-2020", title: "Le montanare di Sal De Riso e Gino Sorbillo per Lezioni di pizza", author: "V. Pagano, Scatti di Gusto", year: 2020, url: "https://www.scattidigusto.it/2020/06/27/le-montanare-di-sal-de-riso-e-gino-sorbillo-per-lezioni-di-pizza", accessed: READ_2026_10_24, status: "plausible" },
  { id: "parla-2008", title: "Starita a Materdei, Naples", author: "K. Parla", year: 2008, url: "https://katieparla.com/starita-a-materdei-naples/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "top-pizza-2022", title: "50 Top Pizza, scheda «Starita a Materdei»", year: 2022, url: "https://www.50toppizza.it/referenza/starita-a-materdei-2022", accessed: READ_2026_10_24, status: "plausible" },

  /* ── Farine (schede dei produttori) ── */
  { id: "caputo-pizzeria-2025", title: "Mulino Caputo, «Pizzeria»", noteKey: "manufacturer-sheet", year: 2025, url: "https://www.mulinocaputo.it/prodotti/pizzeria/", accessed: READ_2026_10_24, status: "verified" },
  { id: "caputo-pizzeria-professional-2025", title: "Mulino Caputo, «Pizzeria professional»", noteKey: "manufacturer-sheet", year: 2025, url: "https://www.mulinocaputo.it/prodotti/pizzeria-professional/", accessed: READ_2026_10_24, status: "verified" },
  { id: "caputo-nuvola-2025", title: "Mulino Caputo, «Nuvola»", noteKey: "manufacturer-sheet", year: 2025, url: "https://www.mulinocaputo.it/prodotti/nuvola/", accessed: READ_2026_10_24, status: "verified" },
  { id: "caputo-saccorosso-2024", title: "Mulino Caputo, «Saccorosso»", noteKey: "manufacturer-sheet", year: 2024, url: "https://www.mulinocaputo.it/prodotti/saccorosso/", accessed: READ_2026_10_24, status: "verified" },
  { id: "caputo-manitoba-oro-2025", title: "Mulino Caputo, «Manitoba Oro»", noteKey: "manufacturer-sheet", year: 2025, url: "https://www.mulinocaputo.it/prodotti/manitoba-oro/", accessed: READ_2026_10_24, status: "verified" },
  { id: "quaglia-petra-5037", title: "Molino Quaglia, «Petra 5037»", noteKey: "manufacturer-sheet", url: "https://www.farinapetra.it/CARDS/farina/?bn=farinapetra&ct=card&dfbg=catalogopetra&mt=no&nosh=1&nmm=1&urlplk=farine-pizzeria&permalink=/petra-5037", accessed: READ_2026_10_24, status: "verified" },
  { id: "quaglia-petra-3", title: "Molino Quaglia, «Petra 3»", noteKey: "manufacturer-sheet", url: "https://www.farinapetra.it/CARDS/farina/?bn=farinapetra&ct=card&dfbg=catalogopetra&mt=no&nosh=1&nmm=1&urlplk=macinate-a-pietra&permalink=/petra-3", accessed: READ_2026_10_24, status: "verified" },
  { id: "agugiaro-figna-2025", title: "Le 5 Stagioni, «Pizza Napoletana» rossa", noteKey: "manufacturer-sheet", author: "Agugiaro & Figna", year: 2025, url: "https://le5stagioni.com/prodotto/pizza-napoletana-rossa/", accessed: READ_2026_10_24, status: "verified" },

  /* ── Lievito e temperatura ── */
  { id: "salvado-2011", title: "Temperature adaptation markedly determines evolution within the genus Saccharomyces", author: "Z. Salvadó et al., Applied and Environmental Microbiology 77(7)", year: 2011, url: "https://doi.org/10.1128/AEM.01861-10", accessed: READ_2026_10_24, status: "verified" },
  { id: "baranyi-2017", title: "Rethinking Tertiary Models: Relationships between Growth Parameters of Bacillus cereus Strains", author: "J. Baranyi et al., Frontiers in Microbiology 8", year: 2017, url: "https://doi.org/10.3389/fmicb.2017.01890", accessed: READ_2026_10_24, status: "verified" },
  { id: "gist-brocades-1993", title: "EP 0 556 905 A1, «Cold-sensitive strain»", author: "K. A. Osinga (Gist-Brocades)", year: 1993, url: "https://data.epo.org/publication-server/rest/v1.2/patents/EP0556905NWA1/document.html", accessed: READ_2026_10_24, status: "plausible" },
  /* Citata prima per il Q10 a freddo: è una review sui soft sensor, non parla di lievito. */
  { id: "pmc7146123", title: "PMC7146123", accessed: READ_2026_10_24, status: "wrong" },

  /* ── Prefermenti e autolisi (docs/ricerca/prefermenti-fonti-2026-10-24.md) ── */
  { id: "king-arthur-preferment", title: "King Arthur Baking, Preferment (Pro reference)", url: "https://www.kingarthurbaking.com/pro/reference/preferment", accessed: READ_2026_10_24, status: "verified" },
  { id: "king-arthur-preferments-2020", title: "Baking with preferments", author: "M. Philip, King Arthur Baking", year: 2020, url: "https://www.kingarthurbaking.com/blog/2020/02/05/baking-with-preferments", accessed: READ_2026_10_24, status: "verified" },
  { id: "king-arthur-autolyse-2017", title: "King Arthur Baking (blog)", noteKey: "autolyse-calvel", author: "B. Alpern", year: 2017, url: "https://www.kingarthurbaking.com/blog/2017/09/29/autolyse-sourdough", accessed: READ_2026_10_24, status: "verified" },
  { id: "king-arthur-formulas", title: "King Arthur Baking, «French Bread with Poolish», «Sprouted Grain Batard»", noteKey: "recipes", accessed: READ_2026_10_24, status: "verified" },
  { id: "dissapore-biga-2020", title: "Dissapore (biga, poolish)", noteKey: "articles", author: "A. Trezzi", year: 2020, url: "https://www.dissapore.com/cucina/biga-cose-preparazione-e-usi/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "scatti-di-gusto-biga-2017", title: "Scatti di Gusto, C. Zaghini (biga)", year: 2017, url: "https://www.scattidigusto.it/2017/01/27/lezioni-di-pizza-biga-vincente/", accessed: READ_2026_10_24, status: "plausible" },
  { id: "scatti-di-gusto-poolish-2020", title: "Scatti di Gusto, L. Pezzetta (poolish)", year: 2020, url: "https://www.scattidigusto.it/lezioni-di-pizza-il-poolish-o-biga-liquida-di-luca-pezzetta", accessed: READ_2026_10_24, status: "plausible" },
  { id: "ooni-biga-poolish", title: "Ooni, Biga vs poolish", url: "https://ooni.com/blogs/ooni-insights/biga-vs-poolish", accessed: READ_2026_10_24, status: "plausible" },
  { id: "edible-molecules-2018", title: "Indirect methods of baking: biga and poolish", author: "Edible Molecules", year: 2018, url: "https://ediblemolecules.com/blog/indirect-methods-of-baking-biga-and-poolish", accessed: READ_2026_10_24, status: "plausible" },
  { id: "balestra-2015", title: "Journal of Texture Studies 46(4):262–271", noteKey: "abstract-only", author: "F. Balestra, G. G. Pinnavaia, S. Romani", year: 2015, url: "https://doi.org/10.1111/jtxs.12124", accessed: READ_2026_10_24, status: "plausible" },
  { id: "wikipedia-pre-ferment", title: "Wikipedia, Pre-ferment", url: "https://en.wikipedia.org/wiki/Pre-ferment", accessed: READ_2026_10_24, status: "plausible" },

  /* ── Forni e superfici (docs/ricerca/forni-fonti-2026-10-24.md) ── */
  { id: "ooni-2026", title: "Ooni (Koda, Karu, Fyra, Volt)", noteKey: "manufacturer-pages", year: 2026, url: "https://ooni.com/products/ooni-koda-16", accessed: READ_2026_10_24, status: "verified" },
  { id: "gozney-2026", title: "Gozney (Roccbox, Dome, Arc, Tread)", noteKey: "manufacturer-pages", year: 2026, url: "https://www.gozney.com/collections/pizza-ovens", accessed: READ_2026_10_24, status: "verified" },
  { id: "effeuno-2026", title: "Effeuno P134H, P134HA, P234H 509 PRO", noteKey: "manufacturer-sheet", year: 2026, url: "https://www.effeuno.biz/products/p134h-509-pro-forno-elettrico-per-pizza-fino-a-509c", accessed: READ_2026_10_24, status: "verified" },
  { id: "g3-ferrari-delizia", title: "G3 Ferrari, Delizia", url: "https://www.g3ferrari.net/elettrodomestici-per-la-cottura/forni-pizza/delizia-red/", accessed: READ_2026_10_24, status: "verified" },
  { id: "sage-pizzaiolo-manual", title: "Sage, the Smart Oven Pizzaiolo BPZ820/SPZ820", noteKey: "manual", url: "https://assets.sageappliances.com/BPZ820/SPZ820_EU_UG6_H20_WEB.pdf", accessed: READ_2026_10_24, status: "verified" },
  { id: "witt-2026", title: "Witt ETNA Rotante, Piccolo Rotante, eGNITE", noteKey: "manufacturer-sheet", year: 2026, url: "https://b2b.witt.dk/en/item/100000310", accessed: READ_2026_10_24, status: "verified" },
  { id: "clementi-gold", title: "Clementi, Gold legna", url: "https://clementicompany.com/prodotto/gold-legna/", accessed: READ_2026_10_24, status: "verified" },
  { id: "alfa-forni-faq", title: "Alfa Forni", noteKey: "faq", url: "https://help.alfaforni.com/en/en/quali-sono-le-caratteristiche-dei-forni-alfa", accessed: READ_2026_10_24, status: "verified" },
  { id: "bertello-2026", title: "Bertello, SimulFIRE", year: 2026, url: "https://bertello.com/", accessed: READ_2026_10_24, status: "verified" },
  /* Rivenditori e recensioni (fonte secondaria): elenco completo in
   * docs/ricerca/forni-fonti-2026-10-24.md. Non ha un titolo: solo la nota. */
  { id: "ovens-secondary-2026", noteKey: "ovens-secondary", year: 2026, accessed: READ_2026_10_24, status: "plausible" },
  { id: "engineering-toolbox-metals", title: "Engineering ToolBox, Metals, Metallic Elements and Alloys — Thermal Conductivities", url: "https://www.engineeringtoolbox.com/thermal-conductivity-metals-d_858.html", accessed: READ_2026_10_24, status: "verified" },

  /* ── Fonti interne o da verificare ── */
  /* Database di lavoro del progetto (Notion), non pubblico: coefficienti del
   * motore e soglie dei problemi che non hanno ancora una fonte esterna. */
  { id: "vulcan-notion-db", title: "Notion", noteKey: "internal-db", status: "unverified" },
  /* Thickness factor in oz/in² dei calcolatori nordamericani: citato dall'audit, testo non riletto. */
  { id: "lehmann-pmq-thickness", title: "T. Lehmann, PMQ Pizza Magazine (Think Tank): thickness factor in oz/in²", status: "unverified" },
  /* Forni dell'edizione dimostrativa: marchio e dati inventati. */
  { id: "demo", title: "Demo", noteKey: "demo", status: "unverified" },
];

const BY_ID = new Map(SCIENCE_SOURCES.map((source) => [source.id, source]));

export function getScienceSource(id: string): SourceRef | undefined {
  return BY_ID.get(id);
}
