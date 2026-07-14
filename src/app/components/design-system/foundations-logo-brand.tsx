import { motion } from "motion/react";
import { useState } from "react";
import { DoughBlob,type DoughVariant } from "../../features/cooking/dough-mascot";
import { VulcanHero } from "../shared/vulcan-hero";
import type { VulcanVariant } from "../shared/vulcan-logo";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   Logo Brand Sub-sections (extracted from foundations-logo.tsx)
   8. VulcanHero — Composizione armonizzata
   9. FireGlow — Sfondo animato
   10. DoughBlob — Forma organica energy-reactive
   ═══════════════════════════════════════════════════════════ */

/* ── 8. VULCAN HERO — Composizione armonizzata ── */
export function LogoHeroSubSection({ activeVariant }: { activeVariant: VulcanVariant }) {
  return (
    <div>
      <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-logo-brand.vulcanhero-composizione-armonizzata-47cdca7a")}</h3>
      <div className="surface-card p-5">
        <p className="dsx-s-b4252559c3">
          {showcaseMessage("components.design-system.foundations-logo-brand.il-mark-gradient-galleggia-direttamente-ne-e32b95eb")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.foundations-logo-brand.forge-52b7362e")}</span>{showcaseMessage("components.design-system.foundations-logo-brand.come-cristallizzazione-della-sua-energia-o-b89d03df")}</p>

        <div className="mt-5 flex flex-col lg:flex-row gap-6">
          {/* Hero preview — forge variant */}
          <div className="flex flex-col gap-4 items-center lg:items-start dsx-s-867764b6d2">
            <div
              className="flex items-center justify-center rounded-2xl dsx-s-3b058e17a3"
            >
              <VulcanHero size={200} energy={35} blobVariant="forge" logoVariant={activeVariant} />
            </div>

            {/* Scale comparison — 3 energy levels */}
            <div className="flex gap-3 items-end">
              {[
                { energy: 10, label: showcaseMessage("components.design-system.foundations-logo-brand.calmo-5f363095") },
                { energy: 45, label: showcaseMessage("components.design-system.foundations-logo-brand.medio-5ae9f5bf") },
                { energy: 85, label: showcaseMessage("components.design-system.foundations-logo-brand.intenso-90bcd33d") },
              ].map((lvl) => (
                <div key={lvl.label} className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex items-center justify-center rounded-xl dsx-s-87ac121135"
                  >
                    <VulcanHero size={56} energy={lvl.energy} blobVariant="forge" logoVariant={activeVariant} />
                  </div>
                  <span className="type-code dsx-s-7cbd6b9e42">{lvl.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anatomy + specs */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Composition anatomy cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: showcaseMessage("components.design-system.foundations-logo-brand.blob-forge-fd4f6d07"), desc: showcaseMessage("components.design-system.foundations-logo-brand.variante-dedicata-con-keyframes-bottom-hea-9aeb3137"), color: "var(--tertiary)", spec: "keyframes slice-vertex · rotazione 45s" },
                { title: showcaseMessage("components.design-system.foundations-logo-brand.mark-gradient-947174b7"), desc: showcaseMessage("components.design-system.foundations-logo-brand.gradiente-ember-proprietario-a-135-f36b3d--a05f68a7"), color: "var(--logo-solid)", spec: "logo-ember 135° · glow radial" },
                { title: showcaseMessage("components.design-system.foundations-logo-brand.respiro-sync-8f0aec85"), desc: showcaseMessage("components.design-system.foundations-logo-brand.il-mark-respira-1-5-in-scala-sincronizzato-d920beea"), color: "var(--cta)", spec: "scale +-1.5% · sync energy-driven" },
                { title: showcaseMessage("components.design-system.foundations-logo-brand.composizione-bec159c8"), desc: showcaseMessage("components.design-system.foundations-logo-brand.componente-composable-con-5-prop-size-ener-253b8347"), color: "var(--muted-foreground)", spec: "markRatio auto · 5 props" },
              ].map((layer) => (
                <div
                  key={layer.title}
                  className="p-3 rounded-xl dsx-s-d1283e5581"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(layer.color, false) } as any} />
                    <span className="dsx-s-ab460f3048">{layer.title}</span>
                  </div>
                  <p className="dsx-s-f70cba4921">{layer.desc}</p>
                  <code className="dsx-s-bad0168f67">{layer.spec}</code>
                </div>
              ))}
            </div>

            {/* Specs riepilogative */}
            <div className="flex flex-col gap-1.5 mt-1">
              {[
                { prop: showcaseMessage("components.design-system.foundations-logo-brand.forma-d0f2807c"), val: showcaseMessage("components.design-system.foundations-logo-brand.forge-slice-vertex-keyframes-bottom-heavy--7fc6968d") },
                { prop: showcaseMessage("components.design-system.foundations-logo-brand.colore-46db165e"), val: showcaseMessage("components.design-system.foundations-logo-brand.gradiente-ember-135-f36b3d-ea4e27-b93620-60701f05") },
                { prop: showcaseMessage("components.design-system.foundations-logo-brand.layers-f055f18a"), val: showcaseMessage("components.design-system.foundations-logo-brand.mark-gradient-glow-sovrapposto-a-blob-forg-56b59597") },
                { prop: showcaseMessage("components.design-system.foundations-logo-brand.breath-9dc87514"), val: showcaseMessage("components.design-system.foundations-logo-brand.mark-1-5-scala-sync-con-velocita-blob-ener-2a73f6da") },
              ].map((a) => (
                <div key={a.prop} className="flex items-baseline gap-2">
                  <span className="type-code dsx-s-6a25d9f072">{a.prop}</span>
                  <span className="dsx-s-6849179898">{a.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 9. FIREGLOW — Sfondo animato ── */
export function LogoFireGlowSubSection() {
  return (
    <div>
      <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-logo-brand.fireglow-sfondo-animato-warm-8ca46cc5")}</h3>
      <div className="surface-card p-5">
        <p className="dsx-s-b4252559c3">
          {showcaseMessage("components.design-system.foundations-logo-brand.tre-radial-gradient-che-fluttuano-lentamen-8c3fd98e")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.foundations-logo-brand.prefers-reduced-motion-6860b6cd")}</span> {showcaseMessage("components.design-system.foundations-logo-brand.con-un-wash-statico-63a45435")}</p>

        <div className="mt-4 relative h-40 rounded-xl overflow-hidden dsx-s-dd7e961eb3">
          {/* Mini FireGlow simulation */}
          <div className="absolute inset-0 dsx-s-9cf5b3f22c" />
          <motion.div
            animate={{ x: 15, y: -12, scale: 1.05 }}
            transition={showcaseTransition.preset_ccb26171b3} className="dsx-s-d1a1908f79"
          />
          <motion.div
            animate={{ x: 12, y: -10, scale: 1.06 }}
            transition={showcaseTransition.preset_561e1aa98a} className="dsx-s-09e596e5b7"
          />
          <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg dsx-s-ad294b7e04">
            <span className="type-data dsx-s-63782726c0">{showcaseMessage("components.design-system.foundations-logo-brand.3-radial-gradients-drifting-prefers-reduce-6a27a843")}</span>
          </div>
        </div>

        {/* Layer anatomy cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: showcaseMessage("components.design-system.foundations-logo-brand.primary-ember-da47e99f"), desc: showcaseMessage("components.design-system.foundations-logo-brand.radial-gradient-top-right-ciclo-18s-colore-04025cd9"), color: "var(--primary)", spec: "top-right · 18s · opacity 0.12" },
            { title: showcaseMessage("components.design-system.foundations-logo-brand.tertiary-amber-862825f1"), desc: showcaseMessage("components.design-system.foundations-logo-brand.radial-gradient-center-left-ciclo-22s-offs-cb84d077"), color: "var(--tertiary)", spec: "center-left · 22s · opacity 0.09" },
            { title: showcaseMessage("components.design-system.foundations-logo-brand.sienna-bottom-d024660e"), desc: showcaseMessage("components.design-system.foundations-logo-brand.terzo-layer-basso-ciclo-25s-offset-4s-warm-9cfd8452"), color: "var(--secondary)", spec: "bottom · 25s · opacity 0.07" },
          ].map((layer) => (
            <div
              key={layer.title}
              className="p-3 rounded-xl dsx-s-d1283e5581"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0 dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(layer.color, false) } as any} />
                <span className="dsx-s-ab460f3048">{layer.title}</span>
              </div>
              <p className="dsx-s-f70cba4921">{layer.desc}</p>
              <code className="dsx-s-bad0168f67">{layer.spec}</code>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          {[
            { prop: showcaseMessage("components.design-system.foundations-logo-brand.intensity-0ad6e448"), val: showcaseMessage("components.design-system.foundations-logo-brand.prop-0-1-default-0-5-controlla-opacita-bas-b9479ca7") },
            { prop: showcaseMessage("components.design-system.foundations-logo-brand.a11y-9126f700"), val: showcaseMessage("components.design-system.foundations-logo-brand.prefers-reduced-motion-static-wash-senza-a-a1ec28c2") },
          ].map((a) => (
            <div key={a.prop} className="flex items-baseline gap-2">
              <span className="type-code dsx-s-c36042544a">{a.prop}</span>
              <span className="dsx-s-6849179898">{a.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 10. DOUGHBLOB — Forma organica energy-reactive ── */
export function LogoDoughBlobSubSection() {
  const [blobEnergy, setBlobEnergy] = useState(50);
  const [blobVariant, setBlobVariant] = useState<DoughVariant>("stretch");

  const BLOB_VARIANTS: { id: DoughVariant; label: string; energy: number }[] = [
    { id: "rest", label: showcaseMessage("components.design-system.foundations-logo-brand.rest-b79e5f48"), energy: 15 },
    { id: "stretch", label: showcaseMessage("components.design-system.foundations-logo-brand.stretch-b148ed24"), energy: 40 },
    { id: "fold", label: showcaseMessage("components.design-system.foundations-logo-brand.fold-b6ba0db1"), energy: 55 },
    { id: "rise", label: showcaseMessage("components.design-system.foundations-logo-brand.rise-563339f8"), energy: 75 },
    { id: "spin", label: showcaseMessage("components.design-system.foundations-logo-brand.spin-4a6c11ab"), energy: 90 },
    { id: "forge", label: showcaseMessage("components.design-system.foundations-logo-brand.forge-magma-526a19e5"), energy: 80 },
    { id: "neural", label: showcaseMessage("components.design-system.foundations-logo-brand.neural-ai-905fa855"), energy: 95 },
  ];

  return (
    <div>
      <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-logo-brand.doughblob-forma-organica-energy-reactive-fe01c07c")}</h3>
      <div className="surface-card p-5">
        <p className="dsx-s-b4252559c3">
          {showcaseMessage("components.design-system.foundations-logo-brand.forma-organica-a-5-layer-css-che-reagisce--185f73c3")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.foundations-logo-brand.vulcanhero-362578ab")}</span>{showcaseMessage("components.design-system.foundations-logo-brand.nella-composizione-hero-il-blob-usa-la-var-48257d89")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.foundations-logo-brand.forge-52b7362e")}</span> {showcaseMessage("components.design-system.foundations-logo-brand.e-il-mark-gradient-vi-galleggia-al-centro--310d971b")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.foundations-logo-brand.moodfromscore-f02c4f9e")}</span>.
        </p>

        <div className="mt-5 flex flex-col lg:flex-row gap-6">
          {/* Blob standalone + VulcanHero comparison */}
          <div className="flex flex-col gap-4 items-center lg:items-start dsx-s-867764b6d2">
            {/* Side-by-side: standalone blob vs composed VulcanHero */}
            <div className="flex gap-3 items-end">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-2xl dsx-s-9a98e981ed"
                >
                  <DoughBlob variant={blobVariant} size={160} energy={blobEnergy} />
                </div>
                <span className="type-code dsx-s-7cbd6b9e42">{showcaseMessage("components.design-system.foundations-logo-brand.blob-standalone-ff6622a5")}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-2xl dsx-s-64256a7e0a"
                >
                  <VulcanHero size={76} energy={blobEnergy} blobVariant="forge" logoVariant="naturale" />
                </div>
                <span className="type-code dsx-s-7cbd6b9e42">{showcaseMessage("components.design-system.foundations-logo-brand.in-vulcanhero-6cdd814d")}</span>
              </div>
            </div>

            {/* Energy slider */}
            <div className="dsx-s-3cab7ef27d">
              <div className="flex items-center justify-between mb-1.5">
                <span className="dsx-s-ab460f3048">{showcaseMessage("components.design-system.foundations-logo-brand.energy-437bcb15")}</span>
                <span className="type-data dsx-s-9f15ac2970">{blobEnergy}</span>
              </div>
              <input
                type="range"
                aria-label={showcaseMessage("components.design-system.foundations-logo-brand.energy-437bcb15")}
                min={0}
                max={100}
                value={blobEnergy}
                onChange={(e) => setBlobEnergy(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <div className="flex justify-between mt-1 dsx-s-73f63c4e50">
                <span>{showcaseMessage("components.design-system.foundations-logo-brand.0-calmo-77e332c1")}</span>
                <span>{showcaseMessage("components.design-system.foundations-logo-brand.100-intenso-3bdaacf3")}</span>
              </div>
            </div>

            {/* Variant selector */}
            <div className="dsx-s-3cab7ef27d">
              <span className="dsx-s-c7921e395b">{showcaseMessage("components.design-system.foundations-logo-brand.variante-f51a07e2")}</span>
              <div className="flex flex-wrap gap-1.5">
                {BLOB_VARIANTS.map((v) => (
                  <motion.button
                    key={v.id}
                    onClick={() => { setBlobVariant(v.id); setBlobEnergy(v.energy); }}
                    className="px-3 py-1.5 rounded-lg active:scale-95 transition-transform dsx-s-38d1998f4e"
                    style={{ "--dsx-font-weight": toShowcaseCssValue(blobVariant === v.id ? "var(--weight-bold)" : "var(--weight-medium)" as any, true), "--dsx-background": toShowcaseCssValue(blobVariant === v.id ? "var(--primary)" : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(blobVariant === v.id ? "var(--primary-foreground)" : "var(--muted-foreground)", false), "--dsx-border": toShowcaseCssValue(blobVariant === v.id ? "none" : "1px solid var(--outline-variant)", false) } as any}
                  >
                    {v.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Anatomy + specs */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Layer anatomy cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: showcaseMessage("components.design-system.foundations-logo-brand.glow-layer-5782a320"), desc: showcaseMessage("components.design-system.foundations-logo-brand.radial-gradient-smoothed-con-spring-physic-2b3c7b34"), color: "var(--primary)", spec: "opacity 0.08-0.25 · blur 16-32px" },
                { title: showcaseMessage("components.design-system.foundations-logo-brand.corpo-principale-5f3da542"), desc: showcaseMessage("components.design-system.foundations-logo-brand.forma-blob-con-borderradius-morph-a-keyfra-3ed2245d"), color: "var(--tertiary)", spec: `ciclo ${(8 - blobEnergy / 100 * 4.5).toFixed(1)}s · ${blobEnergy}% energy` },
                { title: showcaseMessage("components.design-system.foundations-logo-brand.accent-blob-057cf53e"), desc: showcaseMessage("components.design-system.foundations-logo-brand.secondo-layer-organico-sfalsato-che-arricc-f728d67f"), color: "var(--cta)", spec: "offset fase 40% · scala 0.85x" },
                { title: showcaseMessage("components.design-system.foundations-logo-brand.highlight-ring-7278be18"), desc: showcaseMessage("components.design-system.foundations-logo-brand.riflesso-luce-e-anello-tratteggiato-che-do-708a124d"), color: "var(--muted-foreground)", spec: "dasharray 4 4 · strokeWidth 0.5" },
              ].map((layer) => (
                <div
                  key={layer.title}
                  className="p-3 rounded-xl dsx-s-d1283e5581"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(layer.color, false) } as any} />
                    <span className="dsx-s-ab460f3048">{layer.title}</span>
                  </div>
                  <p className="dsx-s-f70cba4921">{layer.desc}</p>
                  <code className="dsx-s-bad0168f67">{layer.spec}</code>
                </div>
              ))}
            </div>

            {/* Specs riepilogative */}
            <div className="flex flex-col gap-1.5 mt-1">
              {[
                { prop: showcaseMessage("components.design-system.foundations-logo-brand.varianti-f0488d71"), val: showcaseMessage("components.design-system.foundations-logo-brand.5-mood-rest-stretch-fold-rise-spin-mappate-d2517e24") },
                { prop: showcaseMessage("components.design-system.foundations-logo-brand.morph-a97d8697"), val: showcaseMessage("components.design-system.foundations-logo-brand.borderradius-keyframes-organici-stile-mate-8b471f98") },
                { prop: showcaseMessage("components.design-system.foundations-logo-brand.forge-3ab11b75"), val: showcaseMessage("components.design-system.foundations-logo-brand.variante-dedicata-a-vulcanhero-forme-botto-b704cda9") },
                { prop: showcaseMessage("components.design-system.foundations-logo-brand.hero-64b18614"), val: showcaseMessage("components.design-system.foundations-logo-brand.in-vulcanhero-il-blob-e-il-substrato-il-ma-7884a1eb") },
                { prop: showcaseMessage("components.design-system.foundations-logo-brand.a11y-9126f700"), val: showcaseMessage("components.design-system.foundations-logo-brand.prefers-reduced-motion-shape-statica-nessu-3d9abb61") },
              ].map((a) => (
                <div key={a.prop} className="flex items-baseline gap-2">
                  <span className="type-code dsx-s-c36042544a">{a.prop}</span>
                  <span className="dsx-s-6849179898">{a.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
