/* === LEARN PAGE — ridisegnata (feedback giugno 2026) ===
   Da repository freddo a hub caldo: percorso consigliato per il tuo livello,
   card fotografiche, termine del giorno dal glossario.
   Deep-link ?style=<id>: pre-filtra contestualmente (invariato). */

import { useMemo } from "react";
import { t } from "../features/cms/i18n";
import { motion } from "motion/react";
import {
  X,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { Heading } from "../components/ds/index";
import { useCms } from "../features/cms/cms-context";
import { STYLES_DB, SKILL_LEVELS, type SkillLevel } from "../domain/pizza-engine";
import {
  GLOSSARY_TERMS,
  GLOSSARY_CATEGORIES,
  getLocalizedTerm,
} from "../data/glossary-data";
import { FireGlow } from "../features/cooking/fire-glow";
import {
  Bowl,
  Flask,
  RisingDough,
  Oven as OvenIllustration,
  Slice,
} from "../features/cooking/step-illustrations";
import { loadSkill } from "../hooks/use-profile-defaults";

/* ── Percorsi consigliati per livello ── */
const PATHS: Record<
  SkillLevel,
  { title: string; copy: string; styleId: string }
> = {
  1: {
    title: "La tua prima teglia",
    copy: "Niente impastatrice, niente stress: la Teglia Romana perdona tutto e premia subito. Il punto di partenza perfetto.",
    styleId: "teglia_romana",
  },
  2: {
    title: "Alza l'asticella: il padellino",
    copy: "Bordo morbido, base croccante, una padella che hai già in casa. Il salto di qualità più accessibile che ci sia.",
    styleId: "padellino_torino",
  },
  3: {
    title: "La sfida del canotto",
    copy: "Cornicione esplosivo, alta idratazione, pre-fermento. Tutto quello che hai imparato finora, messo alla prova.",
    styleId: "napoletana_canotto",
  },
  4: {
    title: "Maestro del metodo Bonci",
    copy: "Idratazione estrema, pieghe, pazienza. La teglia da maestro che trasforma acqua e farina in una nuvola.",
    styleId: "teglia_romana",
  },
};

/* ── Termine del giorno: scelta deterministica per data ── */
function termOfTheDay() {
  const today = new Date();
  const seed =
    today.getFullYear() * 372 + (today.getMonth() + 1) * 31 + today.getDate();
  return GLOSSARY_TERMS[seed % GLOSSARY_TERMS.length];
}

export function LearnPage() {
  const { cms } = useCms();
  const pg = cms.pages;
  const [searchParams, setSearchParams] = useSearchParams();
  const styleParam = searchParams.get("style");
  const activeStyle =
    styleParam && STYLES_DB[styleParam] ? STYLES_DB[styleParam] : null;
  const linkSearch = activeStyle ? `?style=${activeStyle.id}` : "";

  const skill = loadSkill();

  const localizedPaths = useMemo(() => {
    return {
      1: {
        title: pg.learnPath1Title || PATHS[1].title,
        copy: pg.learnPath1Copy || PATHS[1].copy,
        styleId: PATHS[1].styleId,
      },
      2: {
        title: pg.learnPath2Title || PATHS[2].title,
        copy: pg.learnPath2Copy || PATHS[2].copy,
        styleId: PATHS[2].styleId,
      },
      3: {
        title: pg.learnPath3Title || PATHS[3].title,
        copy: pg.learnPath3Copy || PATHS[3].copy,
        styleId: PATHS[3].styleId,
      },
      4: {
        title: pg.learnPath4Title || PATHS[4].title,
        copy: pg.learnPath4Copy || PATHS[4].copy,
        styleId: PATHS[4].styleId,
      },
    };
  }, [pg]);

  const path = activeStyle
    ? {
        title: activeStyle.name,
        copy: activeStyle.description,
        styleId: activeStyle.id,
      }
    : localizedPaths[skill];
  const skillName = SKILL_LEVELS.find((s) => s.level === skill)?.name ?? "";
  const pathContextLabel = activeStyle
    ? `${pg.learnPathLabel} · ${activeStyle.name}`
    : `Il percorso su misura per te · Livello ${skillName}`;
  const term = getLocalizedTerm(termOfTheDay(), cms);
  const termCat = GLOSSARY_CATEGORIES[term.category];

  const SECTIONS = [
    {
      id: "glossary",
      label: pg.learnGlossary,
      desc: pg.learnGlossaryDesc,
      illustration: Slice,
      to: "/learn/glossary",
      color: "var(--primary)",
    },
    {
      id: "troubleshooting",
      label: pg.learnTroubleshooting,
      desc: pg.learnTroubleshootingDesc,
      illustration: OvenIllustration,
      to: "/learn/troubleshooting",
      color: "var(--tertiary)",
    },
    {
      id: "prefermenti",
      label: pg.learnPreFerments,
      desc: pg.learnPreFermentsDesc,
      illustration: Flask,
      to: "/learn/pre-ferments",
      color: "var(--cta)",
    },
  ];

  return (
    <main
      id="main-content"
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      <FireGlow intensity={0.25} variant="warm" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20 pb-32 relative z-10"
      >
        {/* Banner stile contestuale — visibile solo con ?style=<id> valido. */}
        {activeStyle && (
          <div
            className="flex items-start gap-3 mb-6 px-4 py-3 rounded-2xl"
            style={{
              background: "color-mix(in srgb, var(--primary) 8%, transparent)",
              border: "var(--border-w) solid var(--container-border-subtle)",
            }}
          >
            <div className="flex-1 min-w-0">
              <div
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--text-default)",
                }}
              >
                Stai studiando: {activeStyle.name}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-md)",
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {pg.learnFilterSubtitle}
              </div>
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="flex-shrink-0 active:scale-90 transition-transform"
              style={{ color: "var(--text-muted)", opacity: 0.7 }}
              aria-label={pg.learnRemoveFilter}
              title={pg.learnRemoveFilter}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            HERO EDITORIALE — titolo serif bold + motto corsivo
            Stile allineato a Crea e Scopri.
           ══════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: "var(--space-12)" }}>
          <Heading level="page" style={{ margin: 0 }}>
            {cms.misc.learnHeroTitle1}
            <span
              style={{
                display: "block",
                color: "var(--text-accent)",
                fontWeight: "var(--weight-bold)" as any,
              }}
            >
              {cms.misc.learnHeroTitle2}
            </span>
          </Heading>
          <p
            className="font-serif italic"
            style={{
              fontSize: "var(--font-size-2xl)",
              color: "var(--text-muted)",
              opacity: 0.75,
              lineHeight: "var(--leading-reading)",
              maxWidth: 620,
              marginTop: "var(--space-4)",
              marginBottom: 0,
            }}
          >
            {cms.misc.learnHeroSubtitle}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            PERCORSO CONSIGLIATO — card ember con hero typography
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.05 }}
          style={{ marginBottom: "var(--space-12)" }}
        >
          <div
            style={{
              fontSize: "var(--font-size-md)",
              letterSpacing: "var(--tracking-caps)",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontWeight: "var(--weight-semibold)" as any,
              marginBottom: "var(--space-3)",
            }}
          >
            {pathContextLabel}
          </div>
          <Link
            to={`/recipe/${path.styleId}?mode=adapted`}
            className="block relative overflow-hidden rounded-3xl active:scale-[0.99] transition-all duration-300 group"
            style={{
              textDecoration: "none",
              color: "var(--overlay-text)",
              background: "var(--grad-ember)",
              border: "1px solid color-mix(in srgb, var(--overlay-text) 15%, transparent)",
              boxShadow: "0 12px 40px -12px color-mix(in srgb, var(--primary) 25%, transparent)",
              padding: "var(--space-12) var(--space-10)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 20px 45px -12px color-mix(in srgb, var(--primary) 40%, transparent)";
              e.currentTarget.style.transform = "scale(1.005)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 12px 40px -12px color-mix(in srgb, var(--primary) 25%, transparent)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {/* Hand-drawn illustration — rising dough for the learning path */}
            <div
              className="absolute top-4 right-4 opacity-15 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
            >
              <RisingDough size={90} />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
              <div>
                <span
                  style={{
                    fontSize: "var(--font-size-2xs)",
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-extreme)",
                    textTransform: "uppercase",
                    color: "color-mix(in srgb, var(--overlay-text) 70%, transparent)",
                    borderBottom: "1px solid color-mix(in srgb, var(--overlay-text) 25%, transparent)",
                    paddingBottom: "3px",
                    display: "inline-block",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  {pg.learnPathLabel}
                </span>
                <h3
                  className="font-serif mt-3"
                  style={{
                    fontSize: "clamp(var(--font-size-7xl), 6vw, var(--font-size-9xl))",
                    color: "var(--overlay-text)",
                    lineHeight: "var(--leading-snug)",
                    fontWeight: "var(--weight-bold)" as any,
                    margin: 0,
                  }}
                >
                  {path.title}
                </h3>
                <p
                  className="mt-4"
                  style={{
                    fontSize: "var(--font-size-2xl)",
                    color: "color-mix(in srgb, var(--overlay-text) 85%, transparent)",
                    lineHeight: "var(--leading-reading)",
                    maxWidth: "90%",
                  }}
                >
                  {path.copy}
                </p>
              </div>

              <div className="mt-8">
                <span
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: "var(--overlay-surface)",
                    color: "var(--text-accent)",
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-spread)",
                    textTransform: "uppercase",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  {pg.learnStartPath}
                  <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            TERMINE DEL GIORNO — feature editoriale autonoma
            Divisore decorativo + kicker ambra + card generosa
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
          style={{ marginBottom: "var(--space-12)" }}
        >
          {/* Decorative thin rule — magazine section break */}
          <div
            style={{
              height: "var(--space-px)",
              background: "var(--container-border-subtle)",
              marginBottom: "var(--space-6)",
            }}
          />
          <div
            style={{
              fontSize: "var(--font-size-md)",
              letterSpacing: "var(--tracking-ultra)",
              textTransform: "uppercase",
              color: "var(--tertiary)",
              fontWeight: "var(--weight-bold)" as any,
              marginBottom: "var(--space-4)",
            }}
          >
            {t(pg.learnTermOfTheDay, { category: termCat.label })}
          </div>

          <Link
            to="/learn/glossary"
            className="block rounded-2xl active:scale-[0.99] transition-all duration-300 group"
            style={{
              textDecoration: "none",
              color: "inherit",
              background:
                "linear-gradient(145deg, color-mix(in srgb, var(--tertiary) 6%, var(--container-bg-low)) 0%, var(--container-bg-low) 100%)",
              border: "var(--border-w) solid color-mix(in srgb, var(--tertiary) 18%, var(--container-border))",
              boxShadow: "var(--shadow-sm)",
              padding: "var(--space-10)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
              e.currentTarget.style.borderColor = "color-mix(in srgb, var(--tertiary) 40%, var(--container-border))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              e.currentTarget.style.borderColor = "color-mix(in srgb, var(--tertiary) 18%, var(--container-border))";
            }}
          >
            <div className="flex items-start gap-5">
              <div
                className="flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  width: 56,
                  height: 44,
                }}
              >
                <Bowl size={52} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-serif transition-colors duration-200 group-hover:text-[var(--primary)]"
                  style={{
                    fontSize: "clamp(var(--font-size-6xl), 5vw, var(--font-size-8xl))",
                    fontWeight: "var(--weight-bold)" as any,
                    color: "var(--text-default)",
                    lineHeight: "var(--leading-snug)",
                    margin: 0,
                  }}
                >
                  {term.name}
                  {term.symbol && (
                    <span
                      className="ml-2"
                      style={{
                        fontSize: "var(--font-size-xl)",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                        fontWeight: "var(--weight-regular)" as any,
                      }}
                    >
                      {term.symbol}
                    </span>
                  )}
                </h3>
                <p
                  className="mt-3"
                  style={{
                    fontSize: "var(--font-size-xl-5)",
                    color: "var(--text-muted)",
                    lineHeight: "var(--leading-reading)",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {term.definition}
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-1 mt-5"
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--weight-semibold)" as any,
                color: "var(--tertiary)",
                letterSpacing: "var(--tracking-wide)",
              }}
            >
              <span>{pg.learnOpenGlossary}</span>
              <ChevronRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </div>
          </Link>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            RISORSE — sezioni in calce con intestazione editoriale
           ══════════════════════════════════════════════════════════ */}
        <div>
          {/* Section heading with decorative trailing rule */}
          <div className="flex items-center gap-3" style={{ marginBottom: "var(--space-6)" }}>
            <Heading
              level="md"
              as="h2"
              className="flex-shrink-0"
              style={{ margin: 0, lineHeight: "var(--leading-snug)" }}
            >
              {cms.misc.learnResources}
            </Heading>
            <div
              className="flex-1"
              style={{
                height: "var(--space-px)",
                background: "var(--container-border-subtle)",
              }}
            />
          </div>

          <div className="flex flex-col" style={{ gap: "var(--space-4)" }}>
            {SECTIONS.map((section, i) => {
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    delay: 0.14 + i * 0.06,
                  }}
                >
                  <Link
                    to={section.to + linkSearch}
                    className="relative flex items-center gap-5 rounded-2xl overflow-hidden active:scale-[0.98] transition-all duration-300 group"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      padding: "var(--space-8)",
                      background: `linear-gradient(145deg, color-mix(in srgb, ${section.color} 7%, var(--container-bg-low)) 0%, var(--container-bg-low) 100%)`,
                      border: `var(--border-w) solid color-mix(in srgb, ${section.color} 18%, var(--container-border))`,
                      boxShadow: "var(--shadow-sm)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 12px 35px -10px color-mix(in srgb, ${section.color} 25%, transparent)`;
                      e.currentTarget.style.borderColor = `color-mix(in srgb, ${section.color} 45%, var(--container-border))`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                      e.currentTarget.style.borderColor = `color-mix(in srgb, ${section.color} 18%, var(--container-border))`;
                    }}
                  >
                    <div
                      className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                      style={{
                        width: 56,
                        height: 44,
                      }}
                    >
                      <section.illustration size={52} />
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <div
                        className="font-serif transition-colors duration-200 group-hover:text-[var(--primary)]"
                        style={{
                          fontSize: "var(--font-size-6xl)",
                          fontWeight: "var(--weight-bold)" as any,
                          color: "var(--text-default)",
                          lineHeight: "var(--leading-snug)",
                        }}
                      >
                        {section.label}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--font-size-xl)",
                          color: "var(--text-muted)",
                          marginTop: "var(--space-1)",
                          lineHeight: "var(--leading-relaxed)",
                        }}
                      >
                        {section.desc}
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="relative flex-shrink-0 transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
