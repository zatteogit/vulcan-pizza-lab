import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { Dialog, IconButton } from "../ds/index";
import { VulcanHero } from "./vulcan-hero";
import { AboutLinks, EditionStatement } from "./about-links";
import { BRAND } from "../../config/brand";
import { useCms } from "../../features/cms/cms-context";

/* FW-15 (S01-A-01/B-01/A-05, S18-B-03): livello 1 invariato; sotto, l'edizione
   (partner e neutralità) e le righe verso metodo, fonti, dati e versione. */
export function AboutDialog({ onClose }: { onClose: () => void }) {
  const { cms, bcp47 } = useCms();
  return createPortal(
    <Dialog open onClose={onClose} ariaLabel={cms.ui.aboutLabel} className="about-dialog">
      <IconButton variant="bare" onClick={onClose} aria-label={cms.ui.close} className="about-dialog__close"><X size={20} /></IconButton>
      <div className="about-dialog__content">
        <VulcanHero size={160} energy={40} loops={Infinity} />
        <h2 className="about-dialog__name">{BRAND.fullName}</h2>
        <p className="about-dialog__status">{cms.ui.aboutDevelopment}</p>
        <p className="about-dialog__description">{cms.ui.aboutDescription}</p>
      </div>
      <EditionStatement />
      <AboutLinks locale={bcp47} onNavigate={onClose} />
    </Dialog>, document.body,
  );
}
