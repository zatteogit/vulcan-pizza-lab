import { useEffect,useRef,useState } from "react";
import type { SectionEntry } from "./shared";
import {
AccessibilitaInfo,
ColorSwatch,
LineeGuida,
Panoramica,
resolveVar,
SectionHeader,
SubSectionLabel,
useDSContext,
} from "./shared";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   FOUNDATION SECTIONS 01–11
   All hex values resolved at runtime from CSS custom properties.
   ═══════════════════════════════════════════════════════════ */

/* ── Colour data — only token names, no hardcoded hex ── */
const SEMANTIC_COLORS = [
  { name: showcaseMessage("components.design-system.foundations.primary-a9a96ec0"), cssVar: "--primary" },
  { name: showcaseMessage("components.design-system.foundations.secondary-025de599"), cssVar: "--secondary" },
  { name: showcaseMessage("components.design-system.foundations.tertiary-b710a1f9"), cssVar: "--tertiary" },
  { name: "CTA", cssVar: "--cta" },
  { name: showcaseMessage("components.design-system.foundations.destructive-f58c8364"), cssVar: "--destructive" },
];

const SURFACE_TONES = [
  { name: showcaseMessage("components.design-system.foundations.background-64dd60fe"), cssVar: "--background" },
  { name: showcaseMessage("components.design-system.foundations.surface-cda05ca6"), cssVar: "--surface" },
  { name: showcaseMessage("components.design-system.foundations.srf-lowest-afa31385"), cssVar: "--surface-container-lowest" },
  { name: showcaseMessage("components.design-system.foundations.srf-low-74a8386d"), cssVar: "--surface-container-low" },
  { name: showcaseMessage("components.design-system.foundations.srf-base-e79406de"), cssVar: "--surface-container" },
  { name: showcaseMessage("components.design-system.foundations.srf-high-eb555eb3"), cssVar: "--surface-container-high" },
  { name: showcaseMessage("components.design-system.foundations.srf-highest-bbc4f665"), cssVar: "--surface-container-highest" },
];

const BRAND_TOKENS = [
  { name: showcaseMessage("components.design-system.foundations.terracotta-8be6e64e"), cssVar: "--warm-terracotta" },
  { name: showcaseMessage("components.design-system.foundations.sienna-98f69d71"), cssVar: "--warm-sienna" },
  { name: showcaseMessage("components.design-system.foundations.oak-7badddf1"), cssVar: "--warm-oak" },
  { name: showcaseMessage("components.design-system.foundations.mocha-814d5c90"), cssVar: "--warm-mocha" },
  { name: showcaseMessage("components.design-system.foundations.sage-c3bd776c"), cssVar: "--warm-sage" },
  { name: showcaseMessage("components.design-system.foundations.forest-f41c4e4d"), cssVar: "--warm-forest" },
  { name: showcaseMessage("components.design-system.foundations.olive-8f62f433"), cssVar: "--warm-olive" },
  { name: showcaseMessage("components.design-system.foundations.cream-d1e2abc1"), cssVar: "--warm-cream" },
  { name: showcaseMessage("components.design-system.foundations.linen-74a1ce7d"), cssVar: "--warm-linen" },
  { name: showcaseMessage("components.design-system.foundations.stone-029690b0"), cssVar: "--warm-stone" },
];

const CONTAINER_TOKENS = [
  { token: "primary-container", cssVar: "--primary-container", use: "Background chip/badge primari" },
  { token: "secondary-container", cssVar: "--secondary-container", use: "Container secondari, toggle inattivi" },
  { token: "tertiary-container", cssVar: "--tertiary-container", use: "Accenti gold, badge ambra" },
  { token: "error-container", cssVar: "--error-container", use: "Alert, warning background" },
];

/* ── Primitive Color Scales — hue+lightness, Tier 1 ── */
const PRIMITIVE_SCALES = [
  {
    name: showcaseMessage("components.design-system.foundations.terracotta-8be6e64e"),
    desc: showcaseMessage("components.design-system.foundations.fuoco-brand-primary-976688bf"),
    steps: [
      { n: "50", v: "--color-terracotta-50" },
      { n: "100", v: "--color-terracotta-100" },
      { n: "200", v: "--color-terracotta-200" },
      { n: "300", v: "--color-terracotta-300" },
      { n: "400", v: "--color-terracotta-400" },
      { n: "500", v: "--color-terracotta-500" },
      { n: "600", v: "--color-terracotta-600" },
      { n: "700", v: "--color-terracotta-700" },
      { n: "800", v: "--color-terracotta-800" },
      { n: "900", v: "--color-terracotta-900" },
    ],
  },
  {
    name: showcaseMessage("components.design-system.foundations.amber-27a01d47"),
    desc: showcaseMessage("components.design-system.foundations.crosta-accenti-gold-tertiary-e7cdc087"),
    steps: [
      { n: "50", v: "--color-amber-50" },
      { n: "100", v: "--color-amber-100" },
      { n: "200", v: "--color-amber-200" },
      { n: "300", v: "--color-amber-300" },
      { n: "400", v: "--color-amber-400" },
      { n: "500", v: "--color-amber-500" },
      { n: "600", v: "--color-amber-600" },
      { n: "700", v: "--color-amber-700" },
      { n: "800", v: "--color-amber-800" },
      { n: "900", v: "--color-amber-900" },
    ],
  },
  {
    name: showcaseMessage("components.design-system.foundations.sage-c3bd776c"),
    desc: showcaseMessage("components.design-system.foundations.cta-successo-conferma-99713685"),
    steps: [
      { n: "50", v: "--color-sage-50" },
      { n: "100", v: "--color-sage-100" },
      { n: "200", v: "--color-sage-200" },
      { n: "300", v: "--color-sage-300" },
      { n: "400", v: "--color-sage-400" },
      { n: "500", v: "--color-sage-500" },
      { n: "600", v: "--color-sage-600" },
      { n: "700", v: "--color-sage-700" },
      { n: "800", v: "--color-sage-800" },
      { n: "900", v: "--color-sage-900" },
    ],
  },
  {
    name: showcaseMessage("components.design-system.foundations.parchment-4761c103"),
    desc: showcaseMessage("components.design-system.foundations.surface-background-neutrali-caldi-8de9b898"),
    steps: [
      { n: "0", v: "--color-parchment-0" },
      { n: "50", v: "--color-parchment-50" },
      { n: "100", v: "--color-parchment-100" },
      { n: "200", v: "--color-parchment-200" },
      { n: "300", v: "--color-parchment-300" },
      { n: "400", v: "--color-parchment-400" },
      { n: "500", v: "--color-parchment-500" },
      { n: "600", v: "--color-parchment-600" },
      { n: "700", v: "--color-parchment-700" },
      { n: "800", v: "--color-parchment-800" },
      { n: "900", v: "--color-parchment-900" },
    ],
  },
  {
    name: showcaseMessage("components.design-system.foundations.night-1097b553"),
    desc: showcaseMessage("components.design-system.foundations.dark-mode-surface-foreground-f31700e1"),
    steps: [
      { n: "0", v: "--color-night-0" },
      { n: "100", v: "--color-night-100" },
      { n: "300", v: "--color-night-300" },
      { n: "500", v: "--color-night-500" },
      { n: "700", v: "--color-night-700" },
      { n: "900", v: "--color-night-900" },
      { n: "950", v: "--color-night-950" },
      { n: "1000", v: "--color-night-1000" },
    ],
  },
  {
    name: showcaseMessage("components.design-system.foundations.mocha-814d5c90"),
    desc: showcaseMessage("components.design-system.foundations.secondary-muted-text-borders-caldi-29b24c75"),
    steps: [
      { n: "300", v: "--color-mocha-300" },
      { n: "400", v: "--color-mocha-400" },
      { n: "500", v: "--color-mocha-500" },
      { n: "600", v: "--color-mocha-600" },
      { n: "700", v: "--color-mocha-700" },
      { n: "800", v: "--color-mocha-800" },
    ],
  },
  {
    name: showcaseMessage("components.design-system.foundations.water-de9b1be4"),
    desc: showcaseMessage("components.design-system.foundations.idratazione-temperatura-slider-blue-1ea46748"),
    steps: [
      { n: "100", v: "--color-water-100" },
      { n: "300", v: "--color-water-300" },
      { n: "500", v: "--color-water-500" },
      { n: "700", v: "--color-water-700" },
      { n: "900", v: "--color-water-900" },
    ],
  },
];

const ALL_COLOR_VARS = [
  ...SEMANTIC_COLORS.map((c) => c.cssVar),
  ...SURFACE_TONES.map((s) => s.cssVar),
  ...BRAND_TOKENS.map((b) => b.cssVar),
  ...CONTAINER_TOKENS.map((t) => t.cssVar),
  ...PRIMITIVE_SCALES.flatMap((s) => s.steps.map((st) => st.v)),
];

/* ── Hook to resolve ALL colour vars once ── */
function useColorMap() {
  const { darkMode } = useDSContext();
  const ref = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!ref.current) return;
      const m = new Map<string, string>();
      for (const v of ALL_COLOR_VARS) {
        m.set(v, resolveVar(ref.current, v));
      }
      setMap(m);
    });
    return () => cancelAnimationFrame(raf);
  }, [darkMode]);

  return { ref, map };
}

/* ═══ 01: SISTEMA CROMATICO ═══ */
function ColorSystemSection() {
  const { ref, map } = useColorMap();

  const specsContent = (
    <div className="flex flex-col gap-6">
      {/* Narrative quote */}
      <div className="py-4 pl-6 pr-5 rounded-r-lg dsx-s-d8109df955">
        <p className="dsx-s-c1671dfa92">
          {showcaseMessage("components.design-system.foundations.il-colore-in-vulcan-non-e-decorazione-e-te-21de0899")}</p>
      </div>

      {/* Semantic Colors */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations.ruoli-semantici-cc8c8e69")}</h3>
        <div className="grid grid-cols-5 gap-2">
          {SEMANTIC_COLORS.map((c) => (
            <ColorSwatch
              key={c.cssVar}
              name={c.name}
              cssVar={c.cssVar}
              resolvedHex={map.get(c.cssVar)}
            />
          ))}
        </div>
      </div>

      {/* Surface Tones */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations.surface-tones-68c44ef6")}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-1.5">
          {SURFACE_TONES.map((s) => (
            <ColorSwatch
              key={s.cssVar}
              name={s.name}
              cssVar={s.cssVar}
              resolvedHex={map.get(s.cssVar)}
            />
          ))}
        </div>
      </div>

      {/* Brand Tokens */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations.brand-tokens-warm-f9235fd3")}</h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {BRAND_TOKENS.map((b) => (
            <ColorSwatch
              key={b.cssVar}
              name={b.name}
              cssVar={b.cssVar}
              resolvedHex={map.get(b.cssVar)}
            />
          ))}
        </div>
      </div>

      {/* Containers Table */}
      <div className="surface-card overflow-hidden">
        <div
          className="px-4 py-3 dsx-s-ff83771d47"
        >
          <span className="type-label dsx-s-e2184fadc0">
            {showcaseMessage("components.design-system.foundations.container-m3-94443c18")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full type-data">
            <thead>
              <tr className="dsx-s-664267fa25">
                {["Token", "Valore attuale", "Uso"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left type-label dsx-s-9aa8a919f2"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONTAINER_TOKENS.map((t) => (
                <tr
                  key={t.token} className="dsx-s-ff83771d47"
                >
                  <td className="px-4 py-2.5">
                    <code
                      className="px-1.5 rounded dsx-s-125b59e31e"
                    >
                      {t.token}
                    </code>
                  </td>
                  <td
                    className="px-4 py-2.5 dsx-s-2ad94e7e42"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded dsx-s-f69e30173b"
                        style={{ "--dsx-background": toShowcaseCssValue(`var(${t.cssVar})`, false) } as any}
                      />
                      {map.get(t.cssVar) || "—"}
                    </div>
                  </td>
                  <td
                    className="px-4 py-2.5 dsx-s-63782726c0"
                  >
                    {t.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Primitive Color Scales — Tier 1 */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations.scale-primitive-tier-1-51546c1a")}</h3>
        <p className="dsx-s-4603ffa534">
          {showcaseMessage("components.design-system.foundations.valori-grezzi-con-naming-astratto-51ef8cd9")}<code className="dsx-s-154dc56bcf">--color-{showcaseMessage("components.design-system.foundations.hue-7708f09d")}-{showcaseMessage("components.design-system.foundations.scale-f2b6346a")}</code>{showcaseMessage("components.design-system.foundations.i-token-semantici-tier-2-referenziano-ques-c3a8c83a")}<code className="dsx-s-154dc56bcf">var()</code>.
        </p>
        <div className="flex flex-col gap-4">
          {PRIMITIVE_SCALES.map((scale) => (
            <div key={scale.name} className="surface-card p-4">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="dsx-s-ce5ec66ff8">{scale.name}</span>
                <span className="dsx-s-6849179898">{scale.desc}</span>
              </div>
              <div className="flex gap-1">
                {scale.steps.map((step) => (
                  <div key={step.v} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-lg dsx-s-e10c77a985"
                      style={{ "--dsx-background": toShowcaseCssValue(`var(${step.v})`, false) } as any}
                    />
                    <span className="type-code dsx-s-63782726c0">{step.n}</span>
                    <span className="type-code dsx-s-63782726c0">{map.get(step.v) || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Architecture */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.foundations.architettura-token-2-tier-f3a2e63f")}</span>
        <p className="dsx-s-b8f661b746">
          {showcaseMessage("components.design-system.foundations.naming-convention-da-159e7b5d")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.foundations.namedesigntokens-guide-af8eebc4")}</span>{showcaseMessage("components.design-system.foundations.nessun-hex-hardcoded-nei-componenti-tutti--17608ede")}</p>
        <div className="mt-4 flex flex-col gap-3">
          {[
            { tier: "Tier 1", name: showcaseMessage("components.design-system.foundations.primitivi-61b7829b"), pattern: "--{category}-{hue}-{scale}", example: "--color-terracotta-500: #d04a2f", desc: showcaseMessage("components.design-system.foundations.valori-grezzi-8-hue-scales-typography-spac-29051699") },
            { tier: "Tier 2", name: showcaseMessage("components.design-system.foundations.semantici-80f09656"), pattern: "--{role}-{variant}", example: "--primary: var(--color-terracotta-500)", desc: showcaseMessage("components.design-system.foundations.ruoli-funzionali-consumati-dai-componenti--610d3c97") },
          ].map((t) => (
            <div key={t.tier} className="p-3 rounded-lg flex gap-3 dsx-s-e4f209c55b">
              <div className="type-data dsx-s-a4eabe9f28">{t.tier}</div>
              <div className="flex-1">
                <div className="dsx-s-ab460f3048">{t.name}</div>
                <code className="dsx-s-9de4739d41">{t.pattern}</code>
                <code className="dsx-s-7715110fe5">{t.example}</code>
                <p className="dsx-s-ff544bce2a">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.foundations.sistema-cromatico-77aa138d")}
        description={showcaseMessage("components.design-system.foundations.palette-atelier-stone-duale-light-dark-5-r-6b651576")}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations.il-sistema-cromatico-di-vulcan-traduce-in--9ccdcbbc")}
        principi={[
          showcaseMessage("components.design-system.foundations.mai-hex-hardcoded-nei-componenti-tutti-i-c-1da1bf8b"),
          showcaseMessage("components.design-system.foundations.i-temi-scuri-non-usano-nero-puro-tinta-pri-3616a612"),
          showcaseMessage("components.design-system.foundations.5-ruoli-semantici-coprono-il-95-dei-casi-p-b5ec15a4"),
          showcaseMessage("components.design-system.foundations.surface-tones-da-lowest-a-highest-per-prof-f8e30fd0"),
        ]}
        quandoUsare={showcaseMessage("components.design-system.foundations.usare-sempre-i-token-semantici-tier-2-nei--46ffd243")}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.specifiche-057caf2f")} />
      {specsContent}
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations.usare-var-primary-per-accenti-brand-e-stat-ba5a8f29"),
          showcaseMessage("components.design-system.foundations.alternare-surface-tones-low-base-high-per--b40e6647"),
          showcaseMessage("components.design-system.foundations.usare-color-mix-per-opacita-dinamiche-47bf3992"),
          showcaseMessage("components.design-system.foundations.testare-sempre-in-entrambi-i-temi-54462b14"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations.mai-hex-hardcoded-nei-componenti-d04a2f-019ebf58"),
          showcaseMessage("components.design-system.foundations.mai-token-primitivi-color-terracotta-500-n-9584fdfd"),
          showcaseMessage("components.design-system.foundations.mai-nero-puro-000-in-dark-mode-f380df3c"),
          showcaseMessage("components.design-system.foundations.mai-opacity-css-su-elementi-con-testo-usar-ae19ef46"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.foundations.tutte-le-coppie-foreground-background-risp-6710e9aa") },
        { label: showcaseMessage("components.design-system.foundations.daltonismo-ee9f510d"), desc: showcaseMessage("components.design-system.foundations.i-ruoli-semantici-sono-distinguibili-per-l-f4ba87ae") },
        { label: showcaseMessage("components.design-system.foundations.dark-mode-9cf83d1f"), desc: showcaseMessage("components.design-system.foundations.stessi-rapporti-di-contrasto-del-chiaro-ti-e46795e5") },
      ]} />
    </div>
  );
}

/* ═══ 02: TIPOGRAFIA ═══ */
const TYPE_SCALE = [
  { name: showcaseMessage("components.design-system.foundations.display-l-1cb661cf"), font: "Playfair Display", size: "var(--font-size-10xl)", sizeLabel: "10xl · 56px", token: "--font-size-10xl", weight: 700, lh: "var(--leading-tight)", ls: "var(--tracking-tighter)", lhLabel: "tight", lsLabel: "tighter", sample: showcaseMessage("components.design-system.foundations.vulcan-91cbb945") },
  { name: showcaseMessage("components.design-system.foundations.display-m-7a2fe2fd"), font: "Playfair Display", size: "var(--font-size-9xl)", sizeLabel: "9xl · 40px", token: "--font-size-9xl", weight: 700, lh: "var(--leading-snug)", ls: "var(--tracking-tight)", lhLabel: "snug", lsLabel: "tight", sample: showcaseMessage("components.design-system.foundations.ingegneria-1ad1535f") },
  { name: showcaseMessage("components.design-system.foundations.headline-l-326d69a3"), font: "Playfair Display", size: "var(--font-size-8xl)", sizeLabel: "8xl · 32px", token: "--font-size-8xl", weight: 700, lh: "var(--leading-heading)", ls: "var(--tracking-snug)", lhLabel: "heading", lsLabel: "snug", sample: showcaseMessage("components.design-system.foundations.della-pizza-0b34b22c") },
  { name: showcaseMessage("components.design-system.foundations.headline-m-34c20879"), font: "Playfair Display", size: "var(--font-size-7xl)", sizeLabel: "7xl · 28px", token: "--font-size-7xl", weight: 700, lh: "var(--leading-title)", ls: "var(--tracking-normal)", lhLabel: "title", lsLabel: "normal", sample: showcaseMessage("components.design-system.foundations.forno-a-legna-fd23b413") },
  { name: showcaseMessage("components.design-system.foundations.title-l-e423cd7b"), font: "DM Sans", size: "var(--font-size-6xl)", sizeLabel: "6xl · 22px", token: "--font-size-6xl", weight: 600, lh: "var(--leading-normal)", ls: "var(--tracking-normal)", lhLabel: "normal", lsLabel: "normal", sample: showcaseMessage("components.design-system.foundations.maturazione-lenta-95024a07") },
  { name: showcaseMessage("components.design-system.foundations.title-m-5969b964"), font: "DM Sans", size: "var(--font-size-2xl)", sizeLabel: "2xl · 16px", token: "--font-size-2xl", weight: 600, lh: "var(--leading-relaxed)", ls: "var(--tracking-wider)", lhLabel: "relaxed", lsLabel: "wider", sample: showcaseMessage("components.design-system.foundations.arrhenius-decay-3e3d0486") },
  { name: showcaseMessage("components.design-system.foundations.title-s-622fdfbb"), font: "DM Sans", size: "var(--font-size-xl)", sizeLabel: "xl · 14px", token: "--font-size-xl", weight: 600, lh: "var(--leading-normal)", ls: "var(--tracking-wide)", lhLabel: "normal", lsLabel: "wide", sample: showcaseMessage("components.design-system.foundations.teglia-romana-3dfce708") },
  { name: showcaseMessage("components.design-system.foundations.body-l-15bc4a6e"), font: "DM Sans", size: "var(--font-size-2xl)", sizeLabel: "2xl · 16px", token: "--font-size-2xl", weight: 400, lh: "var(--leading-loose)", ls: "var(--tracking-normal)", lhLabel: "loose", lsLabel: "normal", sample: showcaseMessage("components.design-system.foundations.l-impasto-deve-risultare-liscio-e-teso-dop-59f344a2") },
  { name: showcaseMessage("components.design-system.foundations.body-m-76d0d54c"), font: "DM Sans", size: "var(--font-size-xl)", sizeLabel: "xl · 14px", token: "--font-size-xl", weight: 400, lh: "var(--leading-relaxed)", ls: "var(--tracking-normal)", lhLabel: "relaxed", lsLabel: "normal", sample: showcaseMessage("components.design-system.foundations.cottura-a-485-c-per-60-90-secondi-con-rota-70622cfd") },
  { name: showcaseMessage("components.design-system.foundations.label-l-397071ce"), font: "DM Sans", size: "var(--font-size-lg)", sizeLabel: "lg · 13px", token: "--font-size-lg", weight: 500, lh: "var(--leading-normal)", ls: "var(--tracking-spread)", lhLabel: "normal", lsLabel: "spread", sample: showcaseMessage("components.design-system.foundations.farina-w320-p-l-0-6-b29c5c82") },
  { name: showcaseMessage("components.design-system.foundations.label-m-d8a45955"), font: "DM Sans", size: "var(--font-size-base)", sizeLabel: "base · 11px", token: "--font-size-base", weight: 600, lh: "var(--leading-normal)", ls: "var(--tracking-widest)", lhLabel: "normal", lsLabel: "widest", sample: showcaseMessage("components.design-system.foundations.genera-ricetta-9531077c"), uppercase: true },
  { name: showcaseMessage("components.design-system.foundations.label-s-daf9c74c"), font: "DM Sans", size: "var(--font-size-sm)", sizeLabel: "sm · 10px", token: "--font-size-sm", weight: 600, lh: "var(--leading-normal)", ls: "var(--tracking-widest)", lhLabel: "normal", lsLabel: "widest", sample: showcaseMessage("components.design-system.foundations.idratazione-80-9992047c"), uppercase: true },
] as const;

const FONT_FAMILIES = [
  {
    name: showcaseMessage("components.design-system.foundations.playfair-display-43f08a7a"),
    role: "Display, Headline",
    usage: "h1, h2, hero, titoli sezione, citazioni italic",
    fontFamily: "'Playfair Display', serif",
  },
  {
    name: showcaseMessage("components.design-system.foundations.dm-sans-f9d5aaf0"),
    role: "Body, UI, Label, Data",
    usage: "Testo corpo, bottoni, etichette, chip, label uppercase. tabular-nums per numeri",
    fontFamily: "'DM Sans', sans-serif",
  },
  {
    name: showcaseMessage("components.design-system.foundations.dm-mono-54458ea1"),
    role: "Code, PizzaNerd, Formule",
    usage: "Solo per: formule scientifiche, simboli (W, aw, P/L), badge PizzaNerd, token CSS e codice. Mai per step numbers, label, bottoni o dati generici.",
    fontFamily: "'DM Mono', monospace",
  },
];

function fontFamilyCSS(font: string): string {
  if (font === "DM Mono") return "'DM Mono', monospace";
  if (font === "Playfair Display") return "'Playfair Display', serif";
  return "'DM Sans', sans-serif";
}

function TypographySection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.foundations.tipografia-2bf6eabd")}
        description={showcaseMessage("components.design-system.foundations.3-famiglie-con-ruoli-distinti-tokens-per-s-937ff337")}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations.la-tipografia-di-vulcan-bilancia-personali-076d3570")}
        principi={[
          showcaseMessage("components.design-system.foundations.3-famiglie-con-ruoli-rigidi-nessun-font-vi-dac6360e"),
          showcaseMessage("components.design-system.foundations.dm-mono-e-riservato-a-formule-scientifiche-3c212110"),
          showcaseMessage("components.design-system.foundations.tutti-i-sizing-sono-token-driven-mai-class-92840253"),
          showcaseMessage("components.design-system.foundations.tabular-nums-su-tutti-i-numeri-con-dm-sans-02612e54"),
        ]}
        anatomia={[
          { parte: showcaseMessage("components.design-system.foundations.playfair-display-43f08a7a"), desc: showcaseMessage("components.design-system.foundations.display-headline-titoli-sezione-hero-citaz-b7e1d97e") },
          { parte: showcaseMessage("components.design-system.foundations.dm-sans-f9d5aaf0"), desc: showcaseMessage("components.design-system.foundations.body-ui-label-data-bottoni-chip-testo-corp-4c7dbab8") },
          { parte: showcaseMessage("components.design-system.foundations.dm-mono-54458ea1"), desc: showcaseMessage("components.design-system.foundations.nerd-code-formule-scientifiche-simboli-alv-dedf9737") },
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.specifiche-057caf2f")} />
      <div className="flex flex-col gap-6">
        {/* Font families */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FONT_FAMILIES.map((f) => (
            <div key={f.name} className="surface-card p-4">
              <div style={{ "--dsx-font-family": toShowcaseCssValue(f.fontFamily, false) } as any} className="dsx-s-903fbe2948">{showcaseMessage("components.design-system.foundations.aa-2c419ecc")}</div>
              <div className="dsx-s-ce5ec66ff8">{f.name}</div>
              <div className="dsx-s-06a23ac344">{f.role}</div>
              <p className="dsx-s-f70cba4921">{f.usage}</p>
            </div>
          ))}
        </div>
        {/* Type scale */}
        <div className="surface-card overflow-hidden">
          <div className="px-4 py-3 dsx-s-ff83771d47">
            <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.foundations.type-scale-token-driven-95184df0")}</span>
          </div>
          <div className="flex flex-col">
            {TYPE_SCALE.map((t, i) => (
              <div key={t.name} className="flex items-center gap-4 px-4 py-3 dsx-s-57dac8b284" style={{ "--dsx-border-bottom": toShowcaseCssValue(i < TYPE_SCALE.length - 1 ? "1px solid var(--outline-variant)" : "none", false) } as any}>
                <div className="w-20 flex-shrink-0 type-data dsx-s-63782726c0">{t.name}</div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <span style={{ "--dsx-font-family": toShowcaseCssValue(fontFamilyCSS(t.font), false), "--dsx-font-size": toShowcaseCssValue(t.size, false), "--dsx-font-weight": toShowcaseCssValue(t.weight, true), "--dsx-line-height": toShowcaseCssValue(t.lh, true), "--dsx-letter-spacing": toShowcaseCssValue(t.ls, false), "--dsx-text-transform": toShowcaseCssValue((t as any).uppercase ? "uppercase" : "none", false), "--dsx-font-feature-settings": toShowcaseCssValue(t.font === "Playfair Display" ? "'kern' 1, 'liga' 1, 'calt' 1" : "'kern' 1, 'liga' 1", false) } as any} className="dsx-s-cf97f48b42">{t.sample}</span>
                </div>
                <div className="hidden sm:flex flex-shrink-0 items-center gap-1.5 type-code dsx-s-63782726c0">
                  <span className="dsx-s-b0e08465c2">{t.sizeLabel}</span>
                  <span className="dsx-s-86c88eaa9e">·</span><span>{t.weight}</span>
                  <span className="dsx-s-86c88eaa9e">·</span><span>{t.lhLabel}</span>
                  <span className="dsx-s-86c88eaa9e">·</span><span>{t.lsLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Typography features */}
        <div className="surface-card p-5">
          <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.foundations.features-tipografiche-32f2306b")}</span>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: showcaseMessage("components.design-system.foundations.kerning-ottico-1bb22cdb"), desc: showcaseMessage("components.design-system.foundations.font-kerning-normal-kern-1-su-body-calt-pe-109272f6") },
              { label: showcaseMessage("components.design-system.foundations.text-rendering-dba423c9"), desc: showcaseMessage("components.design-system.foundations.optimizelegibility-webkit-font-smoothing-a-4031534f") },
              { label: showcaseMessage("components.design-system.foundations.paragraph-spacing-edc5a492"), desc: showcaseMessage("components.design-system.foundations.0-75em-text-wrap-pretty-per-righe-finali-7a1a0004") },
              { label: showcaseMessage("components.design-system.foundations.heading-balance-0751517e"), desc: showcaseMessage("components.design-system.foundations.text-wrap-balance-su-h1-h6-word-spacing-0--78e1f7f9") },
              { label: showcaseMessage("components.design-system.foundations.tabular-nums-3516e868"), desc: showcaseMessage("components.design-system.foundations.tnum-1-su-mono-e-numeri-funzionali-3beb2bef") },
              { label: showcaseMessage("components.design-system.foundations.hanging-punct-4205a4bc"), desc: showcaseMessage("components.design-system.foundations.hanging-punctuation-first-allow-end-last-s-645023cc") },
            ].map((spec) => (
              <div key={spec.label} className="p-3 rounded-lg dsx-s-e4f209c55b">
                <span className="dsx-s-97e646b80b">{spec.label}</span>
                <p className="dsx-s-d0b294e222">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations.usare-playfair-display-solo-per-titoli-e-c-dccf9adb"),
          showcaseMessage("components.design-system.foundations.applicare-tabular-nums-su-tutti-i-numeri-a-a8582e9d"),
          showcaseMessage("components.design-system.foundations.usare-token-css-var-font-size-xl-per-tutti-00b3a33e"),
          showcaseMessage("components.design-system.foundations.dm-mono-solo-per-contesti-pizzanerd-formul-398378b8"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations.mai-classi-tailwind-per-font-size-text-2xl-4e889682"),
          showcaseMessage("components.design-system.foundations.mai-dm-mono-per-step-numbers-bottoni-label-aae1009c"),
          showcaseMessage("components.design-system.foundations.mai-dimensioni-inferiori-a-0-6875rem-11px--18bb6d3a"),
          showcaseMessage("components.design-system.foundations.mai-mischiare-font-nello-stesso-elemento-826bdf7d"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations.minimo-88c284d1"), desc: showcaseMessage("components.design-system.foundations.font-size-minimo-0-6875rem-11px-per-label--b983eb47") },
        { label: showcaseMessage("components.design-system.foundations.leggibilita-9cd762b7"), desc: showcaseMessage("components.design-system.foundations.line-height-minimo-1-4-per-corpo-1-1-per-t-f65d5f71") },
        { label: showcaseMessage("components.design-system.foundations.ridimensionamento-153829cb"), desc: showcaseMessage("components.design-system.foundations.tutti-i-sizing-usano-rem-per-rispettare-pr-b939767c") },
      ]} />
    </div>
  );
}

/* ═══ 03/04: SPAZIATURA + FORMA ═══ */
const SPACING_SCALE = [
  { name: "px", token: "--space-px", value: "1px" },
  { name: "0.5", token: "--space-0-5", value: "2px" },
  { name: "1", token: "--space-1", value: "4px" },
  { name: "1.5", token: "--space-1-5", value: "6px" },
  { name: "2", token: "--space-2", value: "8px" },
  { name: "3", token: "--space-3", value: "12px" },
  { name: "4", token: "--space-4", value: "16px" },
  { name: "5", token: "--space-5", value: "20px" },
  { name: "6", token: "--space-6", value: "24px" },
  { name: "8", token: "--space-8", value: "32px" },
  { name: "10", token: "--space-10", value: "40px" },
  { name: "12", token: "--space-12", value: "48px" },
  { name: "16", token: "--space-16", value: "64px" },
];

const RADIUS_SCALE = [
  { name: showcaseMessage("components.design-system.foundations.none-71f8e797"), token: "--radius-none", value: "0px" },
  { name: showcaseMessage("components.design-system.foundations.xs-f9601427"), token: "--radius-xs", value: "4px" },
  { name: showcaseMessage("components.design-system.foundations.sm-3e76c243"), token: "--radius-sm", value: "8px" },
  { name: showcaseMessage("components.design-system.foundations.md-240c4df7"), token: "--radius-md", value: "12px" },
  { name: showcaseMessage("components.design-system.foundations.lg-f0a1ce6f"), token: "--radius-lg", value: "16px" },
  { name: showcaseMessage("components.design-system.foundations.xl-556b15c4"), token: "--radius-xl", value: "20px" },
  { name: showcaseMessage("components.design-system.foundations.2xl-321c15e9"), token: "--radius-2xl", value: "24px" },
  { name: showcaseMessage("components.design-system.foundations.full-52e6d8ab"), token: "--radius-full", value: "9999px" },
];

function SpacingSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.foundations.spaziatura-2e2b4f0c")} description={showcaseMessage("components.design-system.foundations.13-step-da-space-px-a-space-16-token-primi-7756039d")} />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations.scala-di-spaziatura-a-13-step-basati-su-mu-fce86bda")}
        principi={[
          showcaseMessage("components.design-system.foundations.base-4px-la-maggior-parte-degli-step-sono--a7835e27"),
          showcaseMessage("components.design-system.foundations.micro-step-1px-2px-6px-per-bordi-separator-38a304c7"),
          showcaseMessage("components.design-system.foundations.preferire-gap-tailwind-per-layout-flex-gri-a3e168d8"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.specifiche-057caf2f")} />
      <div className="surface-card p-5">
        <div className="flex flex-col gap-2">
          {SPACING_SCALE.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="type-data dsx-s-5f8c283100">{s.name}</span>
              <div className="rounded-sm dsx-s-def9face8c" style={{ "--dsx-width": toShowcaseCssValue(s.value, false) } as any} />
              <span className="type-code dsx-s-63782726c0">{s.token}</span>
              <span className="type-code dsx-s-97e9e092ac ds-showcase__secondary-ink">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations.usare-gap-tailwind-per-spaziatura-flex-gri-e39e4839"),
          showcaseMessage("components.design-system.foundations.token-space-4-16px-come-padding-standard-c-4dfb631b"),
          showcaseMessage("components.design-system.foundations.coerenza-verticale-stesso-gap-tra-sezioni--da102fc5"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations.mai-valori-arbitrari-margin-13px-976ca2be"),
          showcaseMessage("components.design-system.foundations.mai-mescolare-unita-solo-rem-px-via-token-9c88ed09"),
          showcaseMessage("components.design-system.foundations.mai-space-16-dentro-componenti-e-per-sezio-ee61f8a9"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations.touch-target-dc7bb62b"), desc: showcaseMessage("components.design-system.foundations.minimo-44x44px-usare-space-10-40px-padding-f115eb82") },
        { label: showcaseMessage("components.design-system.foundations.separazione-946fcbc0"), desc: showcaseMessage("components.design-system.foundations.spaziatura-minima-space-3-tra-elementi-int-add678e1") },
      ]} />
    </div>
  );
}

function ShapeSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.foundations.forma-border-radius-20c27e73")} description={showcaseMessage("components.design-system.foundations.8-step-da-radius-none-a-radius-full-token--374d683e")} />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations.il-sistema-di-border-radius-definisce-la-m-96fbcd3c")}
        principi={[
          showcaseMessage("components.design-system.foundations.card-container-radius-lg-16px-come-default-9648cf76"),
          showcaseMessage("components.design-system.foundations.chip-e-badge-radius-xl-20px-per-forme-orga-1070a4ac"),
          showcaseMessage("components.design-system.foundations.bottoni-pill-radius-full-9999px-per-cta-pr-6f75d9ba"),
          showcaseMessage("components.design-system.foundations.input-radius-md-12px-per-equilibrio-funzio-e0bdd48c"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.specifiche-057caf2f")} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {RADIUS_SCALE.map((r) => (
          <div key={r.name} className="surface-card p-4 flex flex-col items-center gap-3">
            <div className="w-16 h-16 dsx-s-f7723b6f61" style={{ "--dsx-border-radius": toShowcaseCssValue(r.value, false) } as any} />
            <div className="text-center">
              <div className="type-code dsx-s-a57c4bed75">{r.name}</div>
              <div className="type-code dsx-s-b0e08465c2">{r.token}</div>
              <div className="type-code dsx-s-63782726c0">{r.value}</div>
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations.usare-radius-lg-come-default-per-card-e-co-e73325f6"),
          showcaseMessage("components.design-system.foundations.usare-radius-full-per-bottoni-cta-e-chip-a-03e51a1f"),
          showcaseMessage("components.design-system.foundations.coerenza-stesso-radius-su-elementi-allo-st-069ae164"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations.mai-radius-arbitrari-border-radius-7px-c8119a96"),
          showcaseMessage("components.design-system.foundations.mai-radius-diversi-su-elementi-adiacenti-d-eceec3e8"),
          showcaseMessage("components.design-system.foundations.mai-radius-none-su-elementi-interattivi-dcc99a0c"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations.focus-ring-f71d645b"), desc: showcaseMessage("components.design-system.foundations.il-border-radius-del-focus-ring-segue-quel-35f429de") },
        { label: showcaseMessage("components.design-system.foundations.touch-target-dc7bb62b"), desc: showcaseMessage("components.design-system.foundations.il-radius-non-deve-ridurre-l-area-cliccabi-5da8d8d1") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   (Elevation, States, Motion, Icons, Gradients, TimePalette, A11y
    moved to foundations-dynamics.tsx)
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "colors", label: showcaseMessage("components.design-system.foundations.sistema-cromatico-77aa138d"), group: "f", Component: ColorSystemSection },
  { id: "typography", label: showcaseMessage("components.design-system.foundations.tipografia-2bf6eabd"), group: "f", Component: TypographySection },
  { id: "spacing", label: showcaseMessage("components.design-system.foundations.spaziatura-2e2b4f0c"), group: "f", Component: SpacingSection },
  { id: "shape", label: showcaseMessage("components.design-system.foundations.forma-border-radius-20c27e73"), group: "f", Component: ShapeSection },
];
