import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { Dialog, IconButton } from "../ds/index";
import { VulcanHero } from "./vulcan-hero";
import { BRAND } from "../../config/brand";
import { useCms } from "../../features/cms/cms-context";

export function AboutDialog({ onClose }: { onClose: () => void }) {
  const { cms } = useCms();
  return createPortal(
    <Dialog open onClose={onClose} ariaLabel={cms.ui.aboutLabel} className="about-dialog">
      <IconButton variant="bare" onClick={onClose} aria-label={cms.ui.close} className="about-dialog__close"><X size={20} /></IconButton>
      <div className="about-dialog__content">
        <VulcanHero size={220} energy={40} loops={Infinity} />
        <h2 className="about-dialog__name">{BRAND.fullName}</h2>
        <p className="about-dialog__status">{cms.ui.aboutDevelopment}</p>
        <p className="about-dialog__description">{cms.ui.aboutDescription}</p>
      </div>
    </Dialog>, document.body,
  );
}
