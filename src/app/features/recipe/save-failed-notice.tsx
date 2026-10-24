import { useEffect } from "react";
import { Snackbar } from "../../components/ds/index";
import type { CmsContent } from "../cms/cms-context";

/* ═══ U-1 — il salvataggio non è riuscito ═══
 * Con lo storage del browser pieno la scrittura fallisce: prima il pulsante
 * restava com'era e il toast diceva comunque «aggiunto». Qui lo si dice, con
 * cosa fare. Resta 10 s (un errore si legge con calma) o fino a «Ho capito». */

const VISIBLE_MS = 10_000;

export function SaveFailedNotice({
  open,
  onClose,
  cms,
}: {
  open: boolean;
  onClose: () => void;
  cms: CmsContent;
}) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="save-failed-notice">
      <Snackbar
        message={cms.ui.saveFailedStorage}
        action={cms.ui.saveFailedDismiss}
        onAction={onClose}
        variant="error"
      />
    </div>
  );
}
