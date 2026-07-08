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
    <main id="main-content" className="learn-page">
      <FireGlow intensity={0.25} variant="warm" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="learn-page__container"
        data-region="page"
      >
        {/* Banner stile contestuale — visibile solo con ?style=<id> valido. */}
        {activeStyle && (
          <div className="learn-banner">
            <div className="learn-banner__body">
              <div className="learn-banner__title">
                Stai studiando: {activeStyle.name}
              </div>
              <div className="learn-banner__subtitle">
                {pg.learnFilterSubtitle}
              </div>
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="learn-banner__close"
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
        <div data-region="page-header">
          <Heading level="page">
            {cms.misc.learnHeroTitle1}
            <span className="page-title-accent">
              {cms.misc.learnHeroTitle2}
            </span>
          </Heading>
          <p className="page-lead">
            {cms.misc.learnHeroSubtitle}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            PERCORSO CONSIGLIATO — card ember con hero typography
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          data-region="feature"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.05 }}
          className="learn-path"
        >
          <div className="learn-path__label">{pathContextLabel}</div>
          <Link
            to={`/recipe/${path.styleId}?mode=adapted`}
            className="learn-path__card"
          >
            {/* Hand-drawn illustration — rising dough for the learning path */}
            <div className="learn-path__illustration">
              <RisingDough size={90} />
            </div>

            <div className="learn-path__content">
              <div className="learn-path__body">
                <span className="learn-path__kicker">{pg.learnPathLabel}</span>
                <h3 className="learn-path__title">{path.title}</h3>
                <p className="learn-path__copy">{path.copy}</p>
              </div>

              <div className="learn-path__cta-row">
                <span className="learn-path__cta">
                  {pg.learnStartPath}
                  <ArrowRight size={12} className="learn-path__cta-icon" />
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
          className="learn-term"
        >
          {/* Decorative thin rule — magazine section break */}
          <div className="learn-term__rule" />
          <div className="learn-term__kicker">
            {t(pg.learnTermOfTheDay, { category: termCat.label })}
          </div>

          <Link to="/learn/glossary" className="learn-term__card">
            <div className="learn-term__body">
              <div className="learn-term__icon">
                <Bowl size={52} />
              </div>
              <div className="learn-term__content">
                <h3
                  className={
                    /* Audit lug 2026: i termini lunghi ("P/L (Rapporto
                       Tenacità/Estensibilità)") a 8xl traboccano dalla card su
                       mobile — sopra ~18 caratteri si scende di scala. */
                    term.name.length > 18
                      ? "learn-term__name learn-term__name--long"
                      : "learn-term__name"
                  }
                >
                  {term.name}
                  {term.symbol && (
                    /*  : il simbolo resta agganciato all'ultima parola del
                       termine — mai da solo su una riga (vedova). */
                    <span className="learn-term__symbol">
                      {"\u00A0"}
                      {term.symbol}
                    </span>
                  )}
                </h3>
                <p className="learn-term__definition">{term.definition}</p>
              </div>
            </div>
            <div className="learn-term__footer">
              <span className="learn-term__footer-label">{pg.learnOpenGlossary}</span>
              <ChevronRight size={14} className="learn-term__footer-icon" />
            </div>
          </Link>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            RISORSE — sezioni in calce con intestazione editoriale
           ══════════════════════════════════════════════════════════ */}
        <div data-region="resources">
          {/* Section heading with decorative trailing rule */}
          <div className="learn-resources__heading">
            <Heading level="md" as="h2" className="learn-resources__heading-text">
              {cms.misc.learnResources}
            </Heading>
            <div className="learn-resources__rule" />
          </div>

          <div data-region="collection" className="learn-resources__list">
            {SECTIONS.map((section, i) => {
              return (
                <motion.div
                  key={section.id}
                  data-region="card"
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
                    className="learn-resources__card"
                    style={{ ["--tone" as any]: section.color }}
                  >
                    <div className="learn-resources__icon">
                      <section.illustration size={52} />
                    </div>
                    <div className="learn-resources__content">
                      <div className="learn-resources__label">
                        {section.label}
                      </div>
                      <div className="learn-resources__desc">
                        {section.desc}
                      </div>
                    </div>
                    <ChevronRight size={16} className="learn-resources__chevron" />
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
