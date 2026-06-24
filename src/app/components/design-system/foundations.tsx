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

/* ═══════════════════════════════════════════════════════════
   FOUNDATION SECTIONS 01–11
   All hex values resolved at runtime from CSS custom properties.
   ═══════════════════════════════════════════════════════════ */

/* ── Colour data — only token names, no hardcoded hex ── */
const SEMANTIC_COLORS = [
  { name: "Primary", cssVar: "--primary" },
  { name: "Secondary", cssVar: "--secondary" },
  { name: "Tertiary", cssVar: "--tertiary" },
  { name: "CTA", cssVar: "--cta" },
  { name: "Destructive", cssVar: "--destructive" },
];

const SURFACE_TONES = [
  { name: "Background", cssVar: "--background" },
  { name: "Surface", cssVar: "--surface" },
  { name: "Srf Lowest", cssVar: "--surface-container-lowest" },
  { name: "Srf Low", cssVar: "--surface-container-low" },
  { name: "Srf Base", cssVar: "--surface-container" },
  { name: "Srf High", cssVar: "--surface-container-high" },
  { name: "Srf Highest", cssVar: "--surface-container-highest" },
];

const BRAND_TOKENS = [
  { name: "Terracotta", cssVar: "--warm-terracotta" },
  { name: "Sienna", cssVar: "--warm-sienna" },
  { name: "Oak", cssVar: "--warm-oak" },
  { name: "Mocha", cssVar: "--warm-mocha" },
  { name: "Sage", cssVar: "--warm-sage" },
  { name: "Forest", cssVar: "--warm-forest" },
  { name: "Olive", cssVar: "--warm-olive" },
  { name: "Cream", cssVar: "--warm-cream" },
  { name: "Linen", cssVar: "--warm-linen" },
  { name: "Stone", cssVar: "--warm-stone" },
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
    name: "Terracotta",
    desc: "Fuoco, brand, primary",
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
    name: "Amber",
    desc: "Crosta, accenti gold, tertiary",
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
    name: "Sage",
    desc: "CTA, successo, conferma",
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
    name: "Parchment",
    desc: "Surface, background, neutrali caldi",
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
    name: "Night",
    desc: "Dark mode surface, foreground",
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
    name: "Mocha",
    desc: "Secondary, muted text, borders caldi",
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
    name: "Water",
    desc: "Idratazione, temperatura, slider blue",
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
      <div className="py-4 pl-6 pr-5 rounded-r-lg" style={{ background: "var(--card)", borderLeft: "3px solid var(--primary)" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "var(--font-size-2xl)", lineHeight: "var(--leading-reading)", color: "var(--muted-foreground)" }}>
          "Il colore in Vulcan non è decorazione. È temperatura: il Rust è il calore del forno, lo Stone è la pietra refrattaria, l'Amber il dorato della crosta perfetta."
        </p>
      </div>

      {/* Semantic Colors */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Ruoli Semantici</h3>
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
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Surface Tones</h3>
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
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Brand Tokens (warm-*)</h3>
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
          className="px-4 py-3"
          style={{ borderBottom: "1px solid var(--outline-variant)" }}
        >
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
            Container M3
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full type-data">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--outline-variant)" }}>
                {["Token", "Valore attuale", "Uso"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left type-label"
                    style={{ fontWeight: "var(--weight-semibold)" as any }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONTAINER_TOKENS.map((t) => (
                <tr
                  key={t.token}
                  style={{ borderBottom: "1px solid var(--outline-variant)" }}
                >
                  <td className="px-4 py-2.5">
                    <code
                      className="px-1.5 rounded"
                      style={{
                        background: "var(--surface-container)",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "var(--font-size-base)",
                        color: "var(--primary)",
                      }}
                    >
                      {t.token}
                    </code>
                  </td>
                  <td
                    className="px-4 py-2.5"
                    style={{
                      color: "var(--text-default)",
                      fontFeatureSettings: "'tnum'",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          background: `var(${t.cssVar})`,
                          border: "1px solid var(--outline-variant)",
                        }}
                      />
                      {map.get(t.cssVar) || "—"}
                    </div>
                  </td>
                  <td
                    className="px-4 py-2.5"
                    style={{ color: "var(--muted-foreground)" }}
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
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Scale Primitive (Tier 1)</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", marginBottom: "12px", lineHeight: "var(--leading-relaxed)" }}>
          Valori grezzi con naming astratto <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>--color-{"{hue}"}-{"{scale}"}</code>. I token semantici (Tier 2) referenziano questi via <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>var()</code>.
        </p>
        <div className="flex flex-col gap-4">
          {PRIMITIVE_SCALES.map((scale) => (
            <div key={scale.name} className="surface-card p-4">
              <div className="flex items-baseline gap-2 mb-3">
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{scale.name}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>{scale.desc}</span>
              </div>
              <div className="flex gap-1">
                {scale.steps.map((step) => (
                  <div key={step.v} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-lg"
                      style={{
                        aspectRatio: "1",
                        background: `var(${step.v})`,
                        border: "1px solid var(--outline-variant)",
                      }}
                    />
                    <span className="type-code" style={{ color: "var(--muted-foreground)" }}>{step.n}</span>
                    <span className="type-code" style={{ color: "var(--muted-foreground)" }}>{map.get(step.v) || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Architecture */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Architettura Token — 2 Tier</span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", marginTop: "6px", lineHeight: "var(--leading-relaxed)" }}>
          Naming convention da <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>namedesigntokens.guide</span>. Nessun hex hardcoded nei componenti: tutti i colori passano attraverso i 2 tier.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {[
            { tier: "Tier 1", name: "Primitivi", pattern: "--{category}-{hue}-{scale}", example: "--color-terracotta-500: #d04a2f", desc: "Valori grezzi. 8 hue scales + typography + spacing + radius + border." },
            { tier: "Tier 2", name: "Semantici", pattern: "--{role}-{variant}", example: "--primary: var(--color-terracotta-500)", desc: "Ruoli funzionali. Consumati dai componenti. Si invertono in dark mode." },
          ].map((t) => (
            <div key={t.tier} className="p-3 rounded-lg flex gap-3" style={{ background: "var(--surface-container)" }}>
              <div className="type-data" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--primary)", width: "48px", flexShrink: 0, paddingTop: "2px" }}>{t.tier}</div>
              <div className="flex-1">
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{t.name}</div>
                <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", display: "block", marginTop: "2px" }}>{t.pattern}</code>
                <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", color: "var(--primary)", display: "block", marginTop: "4px" }}>{t.example}</code>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "4px", lineHeight: "var(--leading-body)" }}>{t.desc}</p>
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
        title="Sistema Cromatico"
        description="Palette Atelier Stone duale Light/Dark. 5 ruoli semantici, surface tones, fixed variants, inverse e shadow separato."
      />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il sistema cromatico di Vulcan traduce in colore l'esperienza sensoriale della pizza: il terracotta del forno, il salvia della freschezza, l'ambra della crosta dorata. Architettura a 2 tier con inversione automatica in dark mode."
        principi={[
          "Mai hex hardcoded nei componenti: tutti i colori passano da CSS custom properties",
          "I temi scuri non usano nero puro — tinta Primary al 8-12% per calore percepito",
          "5 ruoli semantici coprono il 95% dei casi: Primary, Secondary, Tertiary, CTA, Destructive",
          "Surface tones da Lowest a Highest per profondità senza box-shadow",
        ]}
        quandoUsare="Usare sempre i token semantici (Tier 2) nei componenti. I primitivi (Tier 1) sono riservati alla definizione dei temi in theme.css."
      />
      <SubSectionLabel label="Specifiche" />
      {specsContent}
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare var(--primary) per accenti brand e stati attivi",
          "Alternare surface tones (Low → Base → High) per gerarchia visiva",
          "Usare color-mix() per opacità dinamiche",
          "Testare sempre in entrambi i temi",
        ]}
        nonFare={[
          "Mai hex hardcoded nei componenti (#D04A2F)",
          "Mai token primitivi (--color-terracotta-500) nei componenti",
          "Mai nero puro (#000) in dark mode",
          "Mai opacity CSS su elementi con testo — usare color-mix()",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Contrasto", desc: "Tutte le coppie foreground/background rispettano WCAG AA (4.5:1 min). CTA supera AAA." },
        { label: "Daltonismo", desc: "I ruoli semantici sono distinguibili per luminosità. Nessuna info veicolata solo dal colore." },
        { label: "Dark mode", desc: "Stessi rapporti di contrasto del chiaro. Tinta Primary al 8-12% evita il 'buco nero'." },
      ]} />
    </div>
  );
}

/* ═══ 02: TIPOGRAFIA ═══ */
const TYPE_SCALE = [
  { name: "Display L", font: "Playfair Display", size: "var(--font-size-10xl)", sizeLabel: "10xl · 56px", token: "--font-size-10xl", weight: 700, lh: "var(--leading-tight)", ls: "var(--tracking-tighter)", lhLabel: "tight", lsLabel: "tighter", sample: "Vulcan" },
  { name: "Display M", font: "Playfair Display", size: "var(--font-size-9xl)", sizeLabel: "9xl · 40px", token: "--font-size-9xl", weight: 700, lh: "var(--leading-snug)", ls: "var(--tracking-tight)", lhLabel: "snug", lsLabel: "tight", sample: "Ingegneria" },
  { name: "Headline L", font: "Playfair Display", size: "var(--font-size-8xl)", sizeLabel: "8xl · 32px", token: "--font-size-8xl", weight: 700, lh: "var(--leading-heading)", ls: "var(--tracking-snug)", lhLabel: "heading", lsLabel: "snug", sample: "della Pizza" },
  { name: "Headline M", font: "Playfair Display", size: "var(--font-size-7xl)", sizeLabel: "7xl · 28px", token: "--font-size-7xl", weight: 700, lh: "var(--leading-title)", ls: "var(--tracking-normal)", lhLabel: "title", lsLabel: "normal", sample: "Forno a Legna" },
  { name: "Title L", font: "DM Sans", size: "var(--font-size-6xl)", sizeLabel: "6xl · 22px", token: "--font-size-6xl", weight: 600, lh: "var(--leading-normal)", ls: "var(--tracking-normal)", lhLabel: "normal", lsLabel: "normal", sample: "Maturazione Lenta" },
  { name: "Title M", font: "DM Sans", size: "var(--font-size-2xl)", sizeLabel: "2xl · 16px", token: "--font-size-2xl", weight: 600, lh: "var(--leading-relaxed)", ls: "var(--tracking-wider)", lhLabel: "relaxed", lsLabel: "wider", sample: "Arrhenius Decay" },
  { name: "Title S", font: "DM Sans", size: "var(--font-size-xl)", sizeLabel: "xl · 14px", token: "--font-size-xl", weight: 600, lh: "var(--leading-normal)", ls: "var(--tracking-wide)", lhLabel: "normal", lsLabel: "wide", sample: "Teglia Romana" },
  { name: "Body L", font: "DM Sans", size: "var(--font-size-2xl)", sizeLabel: "2xl · 16px", token: "--font-size-2xl", weight: 400, lh: "var(--leading-loose)", ls: "var(--tracking-normal)", lhLabel: "loose", lsLabel: "normal", sample: "L'impasto deve risultare liscio e teso dopo le pieghe." },
  { name: "Body M", font: "DM Sans", size: "var(--font-size-xl)", sizeLabel: "xl · 14px", token: "--font-size-xl", weight: 400, lh: "var(--leading-relaxed)", ls: "var(--tracking-normal)", lhLabel: "relaxed", lsLabel: "normal", sample: "Cottura a 485\u00b0C per 60-90 secondi con rotazione." },
  { name: "Label L", font: "DM Sans", size: "var(--font-size-lg)", sizeLabel: "lg · 13px", token: "--font-size-lg", weight: 500, lh: "var(--leading-normal)", ls: "var(--tracking-spread)", lhLabel: "normal", lsLabel: "spread", sample: "Farina W320 P/L 0.6" },
  { name: "Label M", font: "DM Sans", size: "var(--font-size-base)", sizeLabel: "base · 11px", token: "--font-size-base", weight: 600, lh: "var(--leading-normal)", ls: "var(--tracking-widest)", lhLabel: "normal", lsLabel: "widest", sample: "GENERA RICETTA", uppercase: true },
  { name: "Label S", font: "DM Sans", size: "var(--font-size-sm)", sizeLabel: "sm · 10px", token: "--font-size-sm", weight: 600, lh: "var(--leading-normal)", ls: "var(--tracking-widest)", lhLabel: "normal", lsLabel: "widest", sample: "IDRATAZIONE 80%", uppercase: true },
] as const;

const FONT_FAMILIES = [
  {
    name: "Playfair Display",
    role: "Display, Headline",
    usage: "h1, h2, hero, titoli sezione, citazioni italic",
    fontFamily: "'Playfair Display', serif",
  },
  {
    name: "DM Sans",
    role: "Body, UI, Label, Data",
    usage: "Testo corpo, bottoni, etichette, chip, label uppercase. tabular-nums per numeri",
    fontFamily: "'DM Sans', sans-serif",
  },
  {
    name: "DM Mono",
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
        title="Tipografia"
        description="3 famiglie con ruoli distinti. Tokens per size, leading, tracking, weight. Mai classi Tailwind per font-size/weight/line-height."
      />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="La tipografia di Vulcan bilancia personalità editoriale e leggibilità funzionale. Playfair Display per i titoli narrativi, DM Sans per l'interfaccia e i dati funzionali (inclusi step numbers e badge), DM Mono esclusivamente per contesti scientifici/nerd e codice."
        principi={[
          "3 famiglie con ruoli rigidi: nessun font viene usato fuori dal suo contesto",
          "DM Mono è riservato a: formule scientifiche, simboli (W, aw, P/L), badge PizzaNerd, token CSS e codice — mai per step numbers o dati generici",
          "Tutti i sizing sono token-driven: mai classi Tailwind per font-size, font-weight, line-height",
          "tabular-nums su tutti i numeri con DM Sans per allineamento colonnare",
        ]}
        anatomia={[
          { parte: "Playfair Display", desc: "Display, Headline — titoli sezione, hero, citazioni italic" },
          { parte: "DM Sans", desc: "Body, UI, Label, Data — bottoni, chip, testo corpo, etichette, step numbers, badge dati" },
          { parte: "DM Mono", desc: "Nerd, Code — formule scientifiche, simboli alveografici, PizzaNerd mode, token CSS" },
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div className="flex flex-col gap-6">
        {/* Font families */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FONT_FAMILIES.map((f) => (
            <div key={f.name} className="surface-card p-4">
              <div style={{ fontFamily: f.fontFamily, fontSize: "var(--font-size-7xl)", fontWeight: "var(--weight-bold)" as any, lineHeight: "var(--leading-display)", color: "var(--text-default)", marginBottom: "0.5rem" }}>Aa</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{f.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--primary)", fontWeight: "var(--weight-medium)" as any, marginBottom: "0.25rem" }}>{f.role}</div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>{f.usage}</p>
            </div>
          ))}
        </div>
        {/* Type scale */}
        <div className="surface-card overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
            <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Type Scale — Token-driven</span>
          </div>
          <div className="flex flex-col">
            {TYPE_SCALE.map((t, i) => (
              <div key={t.name} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: i < TYPE_SCALE.length - 1 ? "1px solid var(--outline-variant)" : "none" }}>
                <div className="w-20 flex-shrink-0 type-data" style={{ color: "var(--muted-foreground)" }}>{t.name}</div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <span style={{ fontFamily: fontFamilyCSS(t.font), fontSize: t.size, fontWeight: t.weight, lineHeight: t.lh, letterSpacing: t.ls, color: "var(--text-default)", textTransform: (t as any).uppercase ? "uppercase" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", paddingBottom: "0.15em", fontKerning: "normal", fontFeatureSettings: t.font === "Playfair Display" ? "'kern' 1, 'liga' 1, 'calt' 1" : "'kern' 1, 'liga' 1" }}>{t.sample}</span>
                </div>
                <div className="hidden sm:flex flex-shrink-0 items-center gap-1.5 type-code" style={{ color: "var(--muted-foreground)" }}>
                  <span style={{ color: "var(--primary)" }}>{t.sizeLabel}</span>
                  <span style={{ opacity: 0.4 }}>·</span><span>{t.weight}</span>
                  <span style={{ opacity: 0.4 }}>·</span><span>{t.lhLabel}</span>
                  <span style={{ opacity: 0.4 }}>·</span><span>{t.lsLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Typography features */}
        <div className="surface-card p-5">
          <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Features Tipografiche</span>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Kerning ottico", desc: "font-kerning: normal + 'kern' 1 su body. 'calt' per Playfair." },
              { label: "Text rendering", desc: "optimizeLegibility + -webkit-font-smoothing: antialiased." },
              { label: "Paragraph spacing", desc: "0.75em. text-wrap: pretty per righe finali." },
              { label: "Heading balance", desc: "text-wrap: balance su h1-h6. word-spacing: -0.02em." },
              { label: "Tabular nums", desc: "'tnum' 1 su mono e numeri funzionali." },
              { label: "Hanging punct.", desc: "hanging-punctuation: first allow-end last su body." },
            ].map((spec) => (
              <div key={spec.label} className="p-3 rounded-lg" style={{ background: "var(--surface-container)" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--primary)" }}>{spec.label}</span>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "4px", lineHeight: "var(--leading-relaxed)" }}>{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare Playfair Display solo per titoli e citazioni — mai per UI funzionale",
          "Applicare tabular-nums su tutti i numeri allineati",
          "Usare token CSS (var(--font-size-xl)) per tutti i sizing",
          "DM Mono solo per contesti PizzaNerd, formule scientifiche, token CSS e code blocks",
        ]}
        nonFare={[
          "Mai classi Tailwind per font-size (text-2xl), font-weight (font-bold), line-height (leading-*)",
          "Mai DM Mono per step numbers, bottoni, label generiche o testo corpo",
          "Mai dimensioni inferiori a 0.6875rem/11px per qualsiasi testo",
          "Mai mischiare font nello stesso elemento",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Minimo", desc: "Font size minimo 0.6875rem (11px) per label, 0.75rem (12px) per testo descrittivo." },
        { label: "Leggibilità", desc: "Line-height minimo 1.4 per corpo, 1.1 per titoli. Letter-spacing positivo su label uppercase." },
        { label: "Ridimensionamento", desc: "Tutti i sizing usano rem per rispettare preferenze browser." },
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
  { name: "none", token: "--radius-none", value: "0px" },
  { name: "xs", token: "--radius-xs", value: "4px" },
  { name: "sm", token: "--radius-sm", value: "8px" },
  { name: "md", token: "--radius-md", value: "12px" },
  { name: "lg", token: "--radius-lg", value: "16px" },
  { name: "xl", token: "--radius-xl", value: "20px" },
  { name: "2xl", token: "--radius-2xl", value: "24px" },
  { name: "full", token: "--radius-full", value: "9999px" },
];

function SpacingSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Spaziatura" description="13 step da --space-px a --space-16. Token primitivi Tier 1." />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Scala di spaziatura a 13 step basati su multipli di 4px. Token --space-* consumati via inline style o classi Tailwind gap/padding/margin."
        principi={[
          "Base 4px: la maggior parte degli step sono multipli di 4",
          "Micro-step (1px, 2px, 6px) per bordi, separatori e padding interni chip",
          "Preferire gap Tailwind per layout flex/grid, token inline per casi speciali",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div className="surface-card p-5">
        <div className="flex flex-col gap-2">
          {SPACING_SCALE.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="type-data" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--primary)", width: "28px", flexShrink: 0, fontFeatureSettings: "'tnum'" }}>{s.name}</span>
              <div className="rounded-sm" style={{ width: s.value, height: "12px", background: "var(--primary)", opacity: 0.7, minWidth: "1px" }} />
              <span className="type-code" style={{ color: "var(--muted-foreground)" }}>{s.token}</span>
              <span className="type-code" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare gap Tailwind per spaziatura flex/grid",
          "Token --space-4 (16px) come padding standard card",
          "Coerenza verticale: stesso gap tra sezioni affini",
        ]}
        nonFare={[
          "Mai valori arbitrari (margin: 13px)",
          "Mai mescolare unità: solo rem/px via token",
          "Mai --space-16 dentro componenti — è per sezioni",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Touch target", desc: "Minimo 44x44px. Usare --space-10 (40px) + padding per raggiungere il minimo." },
        { label: "Separazione", desc: "Spaziatura minima --space-3 tra elementi interattivi per evitare tap accidentali." },
      ]} />
    </div>
  );
}

function ShapeSection() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Forma (Border Radius)" description="8 step da --radius-none a --radius-full. Token primitivi Tier 1." />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il sistema di border radius definisce la 'morbidezza' dei contenitori. Vulcan usa forme arrotondate per comunicare calore e approccio organico."
        principi={[
          "Card/container: --radius-lg (16px) come default",
          "Chip e badge: --radius-xl (20px) per forme organiche",
          "Bottoni pill: --radius-full (9999px) per CTA primari",
          "Input: --radius-md (12px) per equilibrio funzionale",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {RADIUS_SCALE.map((r) => (
          <div key={r.name} className="surface-card p-4 flex flex-col items-center gap-3">
            <div className="w-16 h-16" style={{ background: "var(--primary)", opacity: 0.15, borderRadius: r.value, border: "2px solid var(--primary)" }} />
            <div className="text-center">
              <div className="type-code" style={{ color: "var(--text-default)" }}>{r.name}</div>
              <div className="type-code" style={{ color: "var(--primary)" }}>{r.token}</div>
              <div className="type-code" style={{ color: "var(--muted-foreground)" }}>{r.value}</div>
            </div>
          </div>
        ))}
      </div>
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare --radius-lg come default per card e container",
          "Usare --radius-full per bottoni CTA e chip attivi",
          "Coerenza: stesso radius su elementi allo stesso livello gerarchico",
        ]}
        nonFare={[
          "Mai radius arbitrari (border-radius: 7px)",
          "Mai radius diversi su elementi adiacenti dello stesso livello",
          "Mai --radius-none su elementi interattivi",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Focus ring", desc: "Il border-radius del focus ring segue quello dell'elemento con +2px di offset." },
        { label: "Touch target", desc: "Il radius non deve ridurre l'area cliccabile effettiva." },
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
  { id: "colors", label: "Sistema Cromatico", group: "f", Component: ColorSystemSection },
  { id: "typography", label: "Tipografia", group: "f", Component: TypographySection },
  { id: "spacing", label: "Spaziatura", group: "f", Component: SpacingSection },
  { id: "shape", label: "Forma (Border Radius)", group: "f", Component: ShapeSection },
];