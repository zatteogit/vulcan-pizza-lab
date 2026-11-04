/* ═══ I18N-2 — traduzioni della libreria condimenti ═══
 * La libreria (topping-library.ts) tiene struttura, dosi e nomi; un file per
 * lingua, italiano compreso dal 31/10/2026 (budget D-059), ha i testi
 * indicizzati per id. Il motore non cambia: legge i testi dalla libreria, che
 * li prende dal catalogo registrato (registry.ts). La UI applica comunque la
 * traduzione con le funzioni di localize.ts. */

export interface ToppingStepTranslation {
  title?: string;
  description?: string;
  /** G3-WP-03: testo per le cotture brevi (vedi ToppingAssemblyStep). */
  description_short_bake?: string;
  /** B3: testo senza appretto in teglia (vedi ToppingAssemblyStep). */
  description_no_pan_proof?: string;
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
