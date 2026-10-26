# Third persona audit: ingredient, geometry and calendar integrity

26 October 2026. The supplied report and JSON archive are simulated-user
software evidence, not interviews or cooking trials. The checkout before these
changes was `5d878120c17b53ec367ad20d32add8f21ee04bdf`.

## H01 — Explicit compound components participate in exclusions

The New York `cheese_ny` sauce declares garlic in its parenthesized composition.
Exclusion checks now inspect those declared components as well as the whole
ingredient. The whole sauce retains its amount, optional flag, section and
identity: no grams are assigned to garlic or other subcomponents. MCP exposes
`declared_components` for inspection and pantry discovery.

Composition is explicit catalog metadata, reviewed from the stated ingredient
labels, rather than a runtime guess from parentheses. A product
name or an unspecified sauce is not treated as a complete recipe; alternative
branches such as water OR cream remain unresolved, rather than being asserted
as jointly present. This is not an allergy or cross-contamination guarantee.
Cases C07/C08 exercise the same garlic refusal in compound and standalone form;
negative controls reject false substring matches and leave unrelated exclusions
inactive.

## H02 — Toppings follow area, not dough mass

The model now binds catalog topping quantities to the style's nominal geometry.
For Detroit the catalog format is **30 × 25 cm = 750 cm²**, not the smaller
30 × 20 cm test tray. The fourfold-area test compares 600 to 2400 cm²: both dough
and topping quantities grow fourfold between those two sizes. It does not assume
that the former unscaled 250 g cheese for 600 cm² was a validated reference dose.

The combined multiplier is the existing format factor (e.g. pizza al metro)
times selected area / nominal area. Thickness, explicit ball weight and unit
count are independent; `ingredients_total` multiplies the already scaled unit
amount exactly once. Rectangular and circular geometry share the same area
calculation as dough mass. Small topping quantities retain one decimal place.
Browser, print and MCP use the same effective multiplier; the original catalog
is not mutated. `topping_geometry` makes reference and selected areas explicit;
UI shows the basis when resizing. Dietary alternatives retain the pan settings.

Area scaling is a product model, not an empirical guarantee of ideal topping
coverage at all sizes or cooking capacity for a very large pan.

## H03/H05 — One calendar reference and readable header dates

Procedure header and steps now share one current-date anchor. The schedule's
instants and durations are unchanged. Header dates use localized compact
weekday/day/month text, placed beneath the complete +/- control row. They no
longer share the narrow column between the shift buttons. Words do not break
internally. Relative labels remain available as the date tooltip; timeline
labels use the current calendar day, including future starts and midnight.
Tests cover IT/EN, +1/+2/+3 days and 320/390/1440 px.

## H04 — Fugazza is an actual method variant

The existing onion-only `fugazza_argentina` topping now declares a single-base
layout using all dough per unit, with no second disc or sealing. Its assembly
step follows shaping instead of internal filling. The choice exposes this
method change before selection and in the generated recipe. Returning to the
filled topping restores the original two-disc layout. Overrides are restricted
to the style to which that recipe is assigned; they cannot unlock Recco through
an unrelated topping. The structural departure also deducts 40 process-axis
points, the same product heuristic as the direct/preferment departure, rather
than retaining an absolute authenticity classification. This is not a physical
measurement of quality.

As a primary authored cooking example, [Laura Grimaldi's Fugazza recipe](https://cocinaconlaura.es/receta-de-pizza-de-cebolla-fugazza/)
shows a single stretched base covered with onion. This supports the distinction
in assembly; Vulcan does not copy its quantities, proof or baking schedule, and
makes no universal claim about all regional naming conventions.

## Verification and boundaries

`kitchen-integrity.test.ts` exercises compound exclusions, negative controls,
rectangular/circular scaling, thickness/count separation, method reversal, pan
retention and calendar labels. The report's 46 archived calls are replayed
through the same engine and then the public MCP transport; four archive aliases
(catalog, guide and the two pantry labels) map to their actual tool names.
Independent sums cover all 44 serialized recipe objects, including alternatives.
Browser evidence and logs are in `output/kitchen-integrity-round3-2026-10-26/`.

Source-copy deduplication preserves all 29 Italian descriptions and all 29
characteristic strings, with the two existing CMS-specific characteristic
exceptions retained. No performance budget or architectural baseline is raised.
Existing limits on professional service flow and starter hydration remain.
