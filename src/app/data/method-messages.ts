/* Budget D-059 (31/10/2026): i testi italiani dei messaggi del motore stanno
 * in method-messages.it.ts (bundle `it` e server). METHOD_MESSAGES_IT resta il
 * nome che il motore legge come testo di riserva dei messaggi (EngineMsg.fallback),
 * ma si riempie alla registrazione: il server registra l'italiano, il
 * CmsProvider e primeLocaleBundle() i messaggi del motore della lingua attiva
 * (`engineMessages`, che contengono le stesse chiavi: la UI li risolve comunque
 * per chiave). Mai leggerlo al caricamento di un modulo: lì si usa un getter. */
export const METHOD_MESSAGES_IT: Record<string, string> = {};

let registeredSource: Record<string, string> | undefined;

/** Sostituisce i testi di riserva dei messaggi del motore. */
export function registerMethodMessages(texts: Record<string, string> | undefined): void {
  if (!texts || texts === registeredSource) return;
  registeredSource = texts;
  for (const key of Object.keys(METHOD_MESSAGES_IT)) delete METHOD_MESSAGES_IT[key];
  Object.assign(METHOD_MESSAGES_IT, texts);
}

/** G1a (budget): staglio e appretto, gli stessi testi nei passi del motore
 *  (MCP) e nel CMS (`timeline.divide`, `divide_teglia`, `proof`). */
export const STEP_COPY_IT = {
  divide: {
    desc: "Dividi in panetti del peso corretto. Forma le palline.",
    tipBeginner: "Usa una bilancia! Taglia con un tarocco e arrotonda ogni pezzo in una palla liscia.",
    tipNerd: "Lo staglio crea tensione superficiale che intrappola CO\u2082 durante l'appretto e definisce la struttura alveolare finale.",
  },
  divideGentle: {
    desc: "Dividi con delicatezza, senza sgonfiare l'impasto.",
    tipBeginner: "Mani delicate! Le bolle nell'impasto sono preziose: piega i lembi sotto, senza schiacciare.",
    tipNerd: "Con idratazione >75% lo staglio aggressivo collassa gli alveoli formati in puntata: tensione minima, degassamento quasi nullo.",
  },
  proof: {
    tipBeginner: "I panetti devono essere morbidi. Se li premi con un dito, tornano su lentamente.",
    tipNerd: "Poke test: ritorno lento = fermentazione ottimale. Troppo rapido = sotto-lievitato. Nessun ritorno = over-proofed.",
  },
} as const;
