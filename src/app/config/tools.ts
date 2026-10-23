/* ═══ STRUMENTI INTERNI — /dev, /cms, /design-system (P-1) ═══
 *
 * Gli strumenti esistono solo in sviluppo e, su richiesta, nell'ambiente di
 * test (`VITE_ENABLE_TOOLS=1` in build). In produzione la costante vale
 * `false` già in compilazione: le rotte cadono sul 404 e i loro chunk non
 * entrano in `dist/`. Decisione del 22/10/2026, handoff §3.4.
 */
export const TOOLS_ENABLED: boolean =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_TOOLS === "1";
