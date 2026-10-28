import { describe, expect, it } from "vitest";
import { getInterpretationsForStyle } from "./interpretation-library";

/* FW-14 (S07-A-01, decisione B del 28/10/2026): sotto la Napoletana STG non
 * si offrono come versioni le ricette canotto (Pepe, Capuano): contraddicono il
 * disciplinare che la scheda stessa cita. Bianco resta sulla STG come
 * «Ispirata a…» (docs/fonti-dati.md §5). */
describe("versioni offerte sulla STG", () => {
  it("nessuna versione con base canotto", () => {
    const offered = getInterpretationsForStyle("napoletana_stg");
    expect(offered.filter((it) => it.base_style_id === "napoletana_canotto").map((it) => it.id)).toEqual([]);
    expect(offered.map((it) => it.id)).not.toContain("pepe_caiazzo");
    expect(offered.map((it) => it.id)).not.toContain("capuano_napoli");
  });
  it("Pepe e Capuano restano sul canotto", () => {
    const canotto = getInterpretationsForStyle("napoletana_canotto").map((it) => it.id);
    expect(canotto).toEqual(expect.arrayContaining(["pepe_caiazzo", "capuano_napoli"]));
  });
});
