/* ═══ I18N-2 — traduzioni della libreria condimenti ═══
 * La libreria (topping-library.ts) resta in italiano ed è la fonte: un file
 * per lingua aggiunge solo i testi tradotti, indicizzati per id. Il motore non
 * cambia (resta neutrale rispetto alla lingua): la UI applica la traduzione
 * con le funzioni di localize.ts. Una voce mancante ricade sull'italiano. */

export interface ToppingStepTranslation {
  title?: string;
  description?: string;
  /** G3-WP-03: testo per le cotture brevi (vedi ToppingAssemblyStep). */
  description_short_bake?: string;
  tip_beginner?: string;
  tip_nerd?: string;
}

export interface ToppingTranslation {
  /** Per id di TOPPING_CONCEPTS. */
  concepts: Record<string, { name?: string; description?: string }>;
  /** Per id di TOPPING_LIBRARY; gli ingredienti per indice nell'elenco. */
  recipes: Record<
    string,
    {
      variant_name?: string;
      name?: string;
      description?: string;
      bake_note?: string;
      ingredients?: Record<string, { name?: string; notes?: string }>;
    }
  >;
  /** Per id del passo (pre_prep_steps e assembly_steps), unico nella libreria. */
  steps: Record<string, ToppingStepTranslation>;
}
