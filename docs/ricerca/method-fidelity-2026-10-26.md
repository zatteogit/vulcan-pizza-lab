# Second audit: formula and method fidelity — 26 October 2026

The source audit used simulated personas, browser observations and MCP responses.
It did not include cooking trials or human participants. These fixes address
observable internal contradictions; they do not validate eating quality or certify
conformity with a protected name or association mark.

## Source → implementation → boundary

- **Recco**: [CCIAA Genova, September 2024 specification, art. 5](https://www.ge.camcom.gov.it/it/promuovi/prodotti-tipici/prodotti-dop-e-igp/disciplinare_focaccia_di_recco_settembre_2024.pdf).
  The hands support and widen each thin sheet. The executable instruction now
  describes that technique; the rolling pin is removed from required equipment.
  Top-sheet vents were already present and remain. This does not certify origin,
  production controls or every specification requirement.
- **APITER**: [Confraternita source, preparation §3–5](https://www.laconfraternitadellapizza.net/documenti/Disciplinare-Autentica-Pizza-In-Teglia-Alla-Romana.pdf).
  Proof is 3–4 hours in a closed container at room temperature, followed by
  stretching; the source asks for a dough-core check of at least 19°C. The preset
  uses 3.5 hours as an explicit model target within that window, not a measured
  readiness guarantee. Preheating occupies the end of that same proof. The
  partition also feeds equivalent fermentation hours and yeast dosing. Other
  references retain their existing phase allocation. APITER is a community
  specification, not a statutory certification. This patch does not implement
  every detail of its machine/no-knead alternatives.
- **AVPN**: [2024 specification, §2.1.2–2.1.3](https://www.pizzanapoletana.org/public/pdf/Disciplinare-2024-ITA.pdf).
  Its documented direct method differs from a user-selected biga or poolish.
  The deviation now deducts 40 process-axis points (12 authenticity points with
  the current weights). This is a product scoring heuristic, not experimental
  quantification. The selected AVPN reference and STG departures are distinct
  metadata; conformity remains uncertified. Dry yeast is not rejected and
  topping oil is not treated as dough fat.
- **Genovese brine**: [Molino Bertolo / Daniele Salmaso, Focaccia genovese](https://www.molinobertolo.it/ita_ricetteDetail.php?oid=81).
  The published brine uses 100 ml water and 5 g salt, with oil applied separately.
  Vulcan adopts that **ratio only**, using 30 ml water + 1.5 g fine salt per unit.
  It retains its separate 15 ml finishing oil and 3 g coarse salt. This is a
  correction to Vulcan's formula, not a full reproduction of the cited recipe,
  and not a claim that the former opaque 30 ml blend had the same composition.
  Both the plain and onion variants expose all four rows with distinct sections.
- **Barese**: no new potato dose is inferred. The existing modeled formula is
  explicitly a **version without potato in the dough**, in catalog description,
  characteristics, recipe note and API metadata. All existing dough quantities
  remain unchanged. This labels this formula honestly; it does not assert that
  all Barese focaccias omit potato.
- **Dietary choices**: Marinara/Bianca get their actual topping names as headings;
  removed and added ingredients appear before the selection action. No filter
  is waived and no alternative is chosen automatically.

## Verification

`method-fidelity.test.ts` reproduces the six regression surfaces via the shared
engine/MCP, including browser reconstruction, yeast partition, phase sum,
reference departure, brine scaling and localization contracts. Existing all-style
and all-signature parity tests remain required. Browser and public transport
artifacts are saved under `output/method-fidelity-2026-10-26/`.

The source's professional service-flow and solid/liquid sourdough questions
remain documented limits, not solved by these six changes. The schedule still
identifies itself as sequential_single_operator; no new starter hydration is
invented.
