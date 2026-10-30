/* === LEARN PAGE — ridisegnata (feedback giugno 2026) ===
   Da repository freddo a hub caldo: percorso consigliato per il tuo livello,
   card fotografiche, termine del giorno dal glossario.
   Deep-link ?style=<id>: mostra solo il banner dello stile; le guide restano
   generali (FW-16, S11-A-01: nessuna sottopagina filtra per stile). */

import { useId, useMemo } from "react";
import { t } from "../features/cms/i18n";
import { motion } from "motion/react";
import {
  X,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { Badge, CtaButton, Heading } from "../components/ds/index";
import { GlossaryTermLinks } from "../features/glossary/term-link";
import { formatDuration } from "../i18n/format";
import { blockerText, primaryBlocker } from "../features/recipe/blocker-text";
import { useCms } from "../features/cms/cms-context";
import { STYLES_DB, SKILL_LEVELS, type SkillLevel } from "../domain/pizza-engine";
import {
  GLOSSARY_TERMS,
  getLocalizedTerm,
} from "../data/glossary-data";
import { QUICK_HELP_ISSUE_IDS } from "../data/troubleshooting-data";
import { GLOSSARY_CATEGORY_ICONS, glossaryCategoryLabel } from "../features/glossary/glossary-categories";
import { FireGlow } from "../features/cooking/fire-glow";
import { GLOSSARY_VISUALS, LearningIllustration, type LearningIllustrationId } from "../features/learning/learning-illustration";
import { learningPathPreview, learningPathRecipe, learningStyleForKitchen } from "../use-cases/learning-path";
import { engineMsgTexts } from "../features/recipe/engine-msg-text";
import { hasChosenSkill, loadSkill, useProfileDefaults } from "../hooks/use-profile-defaults";
import { motionSpring } from "../components/ds/motion";
import { uiMessage } from "../i18n/ui-messages";
import { useDetailLevel } from "../hooks/use-detail-level";
import { METHOD_PATH } from "../features/method/method-link";

/* ── Percorsi consigliati per livello ── */
const PATH_STYLE_IDS: Record<SkillLevel, string> = {
  1: "teglia_romana",
  2: "padellino_torino",
  3: "napoletana_canotto",
  4: "teglia_romana",
};

/* G4a-WP-04 (S11-B-10): «Cosa impari», i termini che la copy del livello cita. */
const PATH_TERMS: Record<SkillLevel, readonly string[]> = {
  1: ["folds", "hydration", "bulk_fermentation"],
  2: ["thermal_conductivity", "maillard"],
  3: ["hydration", "cornicione"],
  4: ["folds", "bulk_fermentation", "proteolysis"],
};

/* ── Termine del giorno: scelta deterministica per data ── */
function termOfTheDay() {
  const today = new Date();
  const seed =
    today.getFullYear() * 372 + (today.getMonth() + 1) * 31 + today.getDate();
  return GLOSSARY_TERMS[seed % GLOSSARY_TERMS.length];
}

export function LearnPage() {
  const { cms, bcp47 } = useCms();
  const { constraints } = useProfileDefaults();
  const { level: detailLevel } = useDetailLevel();
  const pg = cms.pages;
  /* FW-12 (S11-B-14): i link card hanno come nome il titolo e come
     descrizione il testo, non l'intero contenuto della card. */
  const cardIds = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  const styleParam = searchParams.get("style");
  const activeStyle =
    styleParam && STYLES_DB[styleParam] ? STYLES_DB[styleParam] : null;
  /* FW-16 (S11-A-01): le sottopagine non filtrano per stile, quindi il
     parametro non si propaga e il banner dice che le guide sono generali. */

  const skill = loadSkill();

  const skillPath = { title: pg[`learnPath${skill}Title`], copy: pg[`learnPath${skill}Copy`], styleId: PATH_STYLE_IDS[skill] };

  const practicalStyle = useMemo(() => activeStyle
    ? learningPathRecipe(activeStyle, constraints).verdict.outcome === "not_feasible" ? null : activeStyle
    : learningStyleForKitchen(PATH_STYLE_IDS[skill], constraints, STYLES_DB), [activeStyle, constraints, skill]);
  const theoretical = !practicalStyle;
  const fallbackPath = practicalStyle && practicalStyle.id !== PATH_STYLE_IDS[skill];
  /* FW-09 (S11-A-07, S11-B-04, S11-B-09): quando la proposta cambia o manca,
     si dice perché, con il primo blocco del verdetto dello stile preferito. */
  const preferredStyle = activeStyle ?? STYLES_DB[PATH_STYLE_IDS[skill]];
  const preferredBlocker = useMemo(
    () => (theoretical || fallbackPath) && preferredStyle
      ? primaryBlocker(learningPathRecipe(preferredStyle, constraints).verdict)
      : null,
    [theoretical, fallbackPath, preferredStyle, constraints],
  );
  const glutenOnly = preferredBlocker?.kind === "dietary_conflict" && preferredBlocker.filter_id === "allergen:gluten";
  const blockerReason = preferredBlocker && preferredStyle
    ? glutenOnly
      ? uiMessage("pages.learn.glutenNone")
      : uiMessage("pages.learn.blockerLead", [preferredStyle.name, blockerText(preferredBlocker, cms, bcp47)])
    : null;
  const allergenBlocked = preferredBlocker?.kind === "dietary_conflict";
  const path = activeStyle
    ? { title: activeStyle.name, copy: cms.styleDescriptions?.[activeStyle.id] ?? activeStyle.description, styleId: activeStyle.id }
    : theoretical
      ? { title: cms.engineMessages["learn.theoryTitle"], copy: "", styleId: "" }
      : fallbackPath
        ? { title: practicalStyle.name, copy: cms.engineMessages["learn.compatiblePath"], styleId: practicalStyle.id }
        : skillPath;
  if (theoretical) path.copy = blockerReason ?? cms.engineMessages["learn.theoryOnly"];
  else if (fallbackPath && blockerReason && practicalStyle && !activeStyle) {
    path.copy = uiMessage("pages.learn.fallbackReason", [blockerReason, practicalStyle.name]);
  }
  /* FW-11 (S11-A-08): il nome del livello dal CMS, non il dato italiano del motore. */
  const skillName = cms.skillLevels[String(skill)]?.name ?? SKILL_LEVELS.find((s) => s.level === skill)?.name ?? "";
  const pathContextLabel = theoretical || fallbackPath
    ? uiMessage("pages.learn.contextProfile")
    : activeStyle
    ? uiMessage("pages.learn.contextByStyle", [pg.learnPathLabel, activeStyle.name])
    : hasChosenSkill()
      ? uiMessage("pages.learn.contextByLevel", [skillName])
      : uiMessage("pages.learn.contextNoLevel");
  const term = getLocalizedTerm(termOfTheDay(), cms);
  /* G4a-WP-05 (S11-B-15): l'icona dice di che parla il termine, la stessa
     della sua categoria nel glossario. */
  const TermIcon = GLOSSARY_CATEGORY_ICONS[term.category];
  /* G4a-WP-04 (S11-A-02): durata e attrezzatura prima del clic, dalla stessa
     ricetta adattata che apre il link. */
  const preview = useMemo(
    () => practicalStyle ? learningPathPreview(learningPathRecipe(practicalStyle, constraints)) : null,
    [practicalStyle, constraints],
  );
  const about = (m: number) => formatDuration(m < 120 ? m : Math.round(m / 60) * 60, bcp47);
  const levelPath = !activeStyle && !theoretical && !fallbackPath;

  const SECTIONS = [
    {
      id: "glossary",
      label: pg.learnGlossary,
      desc: pg.learnGlossaryDesc,
      illustration: "folds" as LearningIllustrationId,
      to: "/learn/glossary",
    },
    {
      id: "troubleshooting",
      label: pg.learnTroubleshooting,
      desc: pg.learnTroubleshootingDesc,
      illustration: "poke-test" as LearningIllustrationId,
      to: "/learn/troubleshooting",
    },
    {
      id: "prefermenti",
      label: pg.learnPreFerments,
      desc: pg.learnPreFermentsDesc,
      illustration: "poolish" as LearningIllustrationId,
      to: "/learn/pre-ferments",
    },
  ];
  /* FW-15 (S11-A-03/B-01, D-D): l'ingresso a «Metodo e fonti». Con i dettagli
     tecnici attivi (D-C) va in testa alle risorse. */
  const methodSection = {
    id: "method",
    label: uiMessage("pages.method.title"),
    desc: uiMessage("pages.learn.methodDesc"),
    illustration: "windowpane" as LearningIllustrationId,
    to: METHOD_PATH,
  };
  if (detailLevel === "technical") SECTIONS.unshift(methodSection);
  else SECTIONS.push(methodSection);

  return (
    <main id="main-content" className="learn-page" data-page="learn">
      <FireGlow intensity={0.25} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSpring.standard}
        className="learn-page__container"
        data-region="page"
      >
        {/* Banner stile contestuale — visibile solo con ?style=<id> valido. */}
        {activeStyle && (
          <div className="learn-banner">
            <div className="learn-banner__body">
              <div className="learn-banner__title">
                {uiMessage("pages.learn.studying", [activeStyle.name])}
              </div>
              <div className="learn-banner__subtitle">
                {pg.learnFilterSubtitle}
              </div>
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="learn-banner__close"
              aria-label={pg.learnRemoveFilter}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            HERO EDITORIALE — titolo serif bold + motto corsivo
            Stile allineato a Crea e Scopri.
           ══════════════════════════════════════════════════════════ */}
        <header data-region="page-header">
          <Heading level="page">
            {cms.misc.learnHeroTitle1}
            <span className="page-title-accent">
              {cms.misc.learnHeroTitle2}
            </span>
          </Heading>
          <p className="page-lead">
            {cms.misc.learnHeroSubtitle}
          </p>
        </header>

        {/* G4a-WP-05 (S11-B-11): in cucina i problemi comuni sono nel primo
            schermo, un tocco e si apre la soluzione. */}
        <nav data-region="quick-help" aria-labelledby={`${cardIds}-quick-help`}>
          <h2 id={`${cardIds}-quick-help`}>{uiMessage("cooking.trouble.cta")}</h2>
          <ul>
            {/* Il titolo del problema nella lingua attiva (default italiani da ISSUES_DB). */}
            {QUICK_HELP_ISSUE_IDS.map((id) => (
              <li key={id}>
                <Link to={`/learn/troubleshooting?issue=${id}`}>{cms.troubleshootingI18n.issues?.[id]?.symptom}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ══════════════════════════════════════════════════════════
            PERCORSO CONSIGLIATO — card ember con hero typography
           ══════════════════════════════════════════════════════════ */}
        <section
          data-region="feature"
          data-stage="1"
          data-stage-state="recommended"
          className="learn-path"
        >
          {/* S11-B-13: il livello si cambia da qui, non solo dal Profilo. */}
          <div className="learn-path__label">
            {pathContextLabel}
            {levelPath && (
              <Link to="/profile?tab=setup#skill" className="learn-path__change">{uiMessage("pages.learn.changeLevel")}</Link>
            )}
          </div>
          {/* S11-A-10/B-10: una card, un solo link (il CTA, esteso alla card dal
              CSS); i termini restano interattivi, non annidati nel link. */}
          <article
            className="learn-path__card"
            data-attention="recommended"
            aria-labelledby={`${cardIds}-path-title`}
          >
            <div className="learn-path__illustration" aria-hidden="true">
              <LearningIllustration id="ball-shaping" decorative />
            </div>

            <div className="learn-path__content">
              <div className="learn-path__body">
                <h2 id={`${cardIds}-path-title`} className="learn-path__title">{path.title}</h2>
                <p className="learn-path__copy">{path.copy}</p>
              </div>

              {preview && (
                <ul className="learn-path__facts" data-region="path-facts">
                  <Badge as="li" color="currentColor">
                    {preview.coldMinutes > 0
                      ? uiMessage("pages.learn.pathDuration", [about(preview.totalMinutes), about(preview.coldMinutes)])
                      : uiMessage("pages.learn.pathDurationAll", [about(preview.totalMinutes)])}
                  </Badge>
                  {engineMsgTexts(preview.equipment, cms, bcp47).map((text) => (
                    <Badge as="li" color="currentColor" key={text}>{text}</Badge>
                  ))}
                </ul>
              )}

              {levelPath && (
                <GlossaryTermLinks termIds={PATH_TERMS[skill]} label={uiMessage("pages.learn.whatYouLearn")} className="learn-path__terms" />
              )}

              <div className="learn-path__cta-row">
                <Link
                  to={theoretical ? "/learn/glossary" : `/recipe/${path.styleId}?mode=adapted`}
                  className="learn-path__cta"
                  aria-describedby={`${cardIds}-path-title`}
                >
                  {theoretical ? cms.engineMessages["learn.openTheory"] : pg.learnStartPath}
                  <ArrowRight size={12} className="learn-path__cta-icon" />
                </Link>
              </div>
            </div>
          </article>
          {(theoretical || fallbackPath) && (
            <p className="learn-path__actions">
              <CtaButton as={Link} to="/profile" variant="secondary" radius="lg" elevated={false} className="learn-path__action">
                {uiMessage("pages.learn.changeConstraints")}
              </CtaButton>
              <CtaButton as={Link} to="/explore" variant="secondary" radius="lg" elevated={false} className="learn-path__action">
                {uiMessage("pages.learn.compatibleStyles")}
              </CtaButton>
              {theoretical && preferredStyle && !allergenBlocked && (
                <CtaButton as={Link} to={`/recipe/${preferredStyle.id}?mode=canonical`} variant="secondary" radius="lg" elevated={false} className="learn-path__action">
                  {uiMessage("pages.learn.seeReference", [preferredStyle.name])}
                </CtaButton>
              )}
            </p>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════════
            TERMINE DEL GIORNO — feature editoriale autonoma
            Divisore decorativo + kicker ambra + card generosa
           ══════════════════════════════════════════════════════════ */}
        <section
          data-region="section"
          data-stage="2"
          className="learn-term"
        >
          {/* Decorative thin rule — magazine section break */}
          <div className="learn-term__rule" aria-hidden="true" />
          {/* FW-13 (S11-A-13) e FW-12 (S11-B-14): il kicker è il titolo h2 della
              sezione, così il termine (h3) non finisce sotto la card del percorso. */}
          <h2 className="learn-term__kicker">
            {t(pg.learnTermOfTheDay, { category: glossaryCategoryLabel(term.category, cms.glossary) })}
          </h2>

          {/* FW-04 (S11-A-06, S11-B-05): la card apre la voce, non la cima del glossario. */}
          <Link
            to={`/learn/glossary#${term.id}`}
            className="learn-term__card"
            aria-labelledby={`${cardIds}-term-name`}
            aria-describedby={`${cardIds}-term-def`}
          >
            <div className="learn-term__body">
              <div className="learn-term__icon" aria-hidden="true">
                {GLOSSARY_VISUALS[term.id]
                  ? <LearningIllustration id={GLOSSARY_VISUALS[term.id]!} decorative />
                  : <TermIcon size={32} />}
              </div>
              <div className="learn-term__content">
                <h3
                  id={`${cardIds}-term-name`}
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
                  {/* FW-04 (S11-A-12): il simbolo non si ripete se è già nel nome. */}
                  {term.symbol && !term.name.includes(term.symbol) && (
                    /*  : il simbolo resta agganciato all'ultima parola del
                       termine — mai da solo su una riga (vedova). */
                    <span className="learn-term__symbol" aria-hidden="true">
                      {"\u00A0"}
                      {term.symbol}
                    </span>
                  )}
                </h3>
                <p id={`${cardIds}-term-def`} className="learn-term__definition">{term.plainDefinition ?? term.definition}</p>
              </div>
            </div>
            <footer className="learn-term__footer">
              <span className="learn-term__footer-label">{pg.learnOpenTerm}</span>
              <ChevronRight size={14} className="learn-term__footer-icon" />
            </footer>
          </Link>
        </section>

        {/* ══════════════════════════════════════════════════════════
            RISORSE — sezioni in calce con intestazione editoriale
           ══════════════════════════════════════════════════════════ */}
        <section data-region="resources">
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
                <article
                  key={section.id}
                  data-region="card"
                  data-stage={String(i + 3)}
                  data-stage-terminal={i === SECTIONS.length - 1 ? "true" : undefined}
                >
                  <Link
                    to={section.to}
                    className="learn-resources__card"
                    data-tone={section.id}
                  >
                    <div className="learn-resources__icon">
                      <LearningIllustration id={section.illustration} decorative />
                    </div>
                    <div className="learn-resources__content">
                      <h3 className="learn-resources__label">
                        {section.label}
                      </h3>
                      <p className="learn-resources__desc">
                        {section.desc}
                      </p>
                    </div>
                    <ChevronRight size={16} className="learn-resources__chevron" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </motion.div>
    </main>
  );
}
