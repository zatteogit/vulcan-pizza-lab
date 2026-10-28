import { Compass, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { Link } from "react-router";
import { BRAND } from "../../config/brand";
import { CtaButton, Heading } from "../ds/index";
import { motionSpring } from "../ds/motion";

/* ═══ FW-09 (S01-A-07, S01-B-06) — un solo «non trovato» ═══
 * La pagina 404 e lo stile inesistente avevano aspetto, titolo della scheda e
 * vie d'uscita diversi. Qui: codice, titolo, motivo, «Vai a Scopri» e, come
 * seconda via, la ricerca (il recupero più naturale per un link vecchio o uno
 * stile rinominato). I testi arrivano dal chiamante (CMS). */

export function NotFoundState({
  eyebrow,
  title,
  subtitle,
  backTo,
  backLabel,
  searchLabel,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  backTo: string;
  backLabel: string;
  searchLabel: string;
}) {
  useEffect(() => {
    document.title = `${title} · ${BRAND.name}`;
  }, [title]);
  return (
    <main className="notfound-shell" id="main-content">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSpring.pageEnter}
        className="notfound-card"
        aria-labelledby="notfound-title"
      >
        {eyebrow && <p className="type-step-num notfound-num">{eyebrow}</p>}
        <Heading level="page" id="notfound-title" className="notfound-title">
          {title}
        </Heading>
        <p className="type-body-lg notfound-sub">{subtitle}</p>
        <p className="notfound-actions">
          <CtaButton as={Link} to={backTo} className="notfound-cta">
            <Compass size={16} aria-hidden="true" />
            {backLabel}
          </CtaButton>
          <CtaButton
            type="button"
            variant="secondary"
            elevated={false}
            className="notfound-cta"
            onClick={() => window.dispatchEvent(new Event("vulcan:open-search"))}
          >
            <Search size={16} aria-hidden="true" />
            {searchLabel}
          </CtaButton>
        </p>
      </motion.section>
    </main>
  );
}
