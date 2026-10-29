/** Neutral localization contracts shared by domain data and the CMS adapter. */


export interface TroubleshootingMessages {
  categories: Record<string, string>;
  issues: Record<string, {
    symptom: string;
    cause: string;
    testRapido: string;
    fixImmediate: string;
    prevention: string;
  }>;
  contextual: Record<string, { message: string; tip: string }>;
}

export interface GlossaryMessages {
  terms: Record<string, {
    name: string;
    definition: string;
    whyImportant?: string;
    /** FW-05: solo per le formule con parole da tradurre. */
    formula?: string;
    ranges?: { label: string; value: string; note?: string; key?: string }[];
  }>;
}



export interface TroubleshootingMessageSource {
  troubleshootingI18n?: TroubleshootingMessages;
}

export interface GlossaryMessageSource {
  glossaryTerms?: GlossaryMessages;
  /** FW-05: lingua dei numeri interpolati dai fatti del motore. */
  locale?: { id: string };
}
