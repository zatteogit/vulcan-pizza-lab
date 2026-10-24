/* ═══ I18N-5 — traduzioni di ispirazioni e ricette iconiche ═══
 * Come per i condimenti (topping-i18n): interpretation-library.ts e
 * signature-recipes.ts restano in italiano e sono la fonte; un file per lingua
 * aggiunge solo i testi tradotti, per id. Una voce mancante ricade
 * sull'italiano, e il test di copertura lo vieta. */

export interface InspirationTranslation {
  /** Per id di INTERPRETATION_LIBRARY. */
  interpretations: Record<
    string,
    { signature_name?: string; technique_signature?: string; story?: string; badge?: string }
  >;
  /** Per id di SIGNATURE_RECIPES. */
  recipes: Record<string, { name?: string; description?: string }>;
}
