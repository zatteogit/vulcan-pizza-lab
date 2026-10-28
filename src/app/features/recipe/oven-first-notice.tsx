import { ChevronRight, Flame } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { CtaButton, Surface } from "../../components/ds/index";
import { shouldAskForOven } from "../../domain/create-entry";
import type { UserConstraints } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";

/* D-038 (Matteo, 24/10/2026; ripristinata da FW-20): niente wizard all'avvio
 * (NN/g, «Mobile Tutorials»). In Crea si chiede solo il forno, il dato che
 * cambia di più la ricetta, e solo finché non è scelto: chi l'ha già salvato
 * (profilo, onboarding, edizione) non vede nulla. Il resto della cucina si
 * configura a richiesta dal profilo. */
const OVEN_STORAGE_KEY = "vulcan_oven_pref";
const DISMISSED_KEY = "vulcan_oven_notice_dismissed";

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function OvenFirstNotice({
  constraints,
  onChooseOven,
  onClosed,
}: {
  constraints: UserConstraints;
  /** Apre «La tua cucina» nella pagina. */
  onChooseOven: () => void;
  /** La scheda sparisce: il chiamante riporta il focus nella pagina. */
  onClosed?: () => void;
}) {
  const { cms, bcp47 } = useCms();
  const [visible, setVisible] = useState(() =>
    shouldAskForOven({
      ovenSaved: readStorage(OVEN_STORAGE_KEY) !== null,
      dismissed: readStorage(DISMISSED_KEY) === "true",
    }),
  );
  /* Scelto il forno dai chip (che lo salvano nel profilo), la domanda non serve più. */
  const ovenKey = `${constraints.oven_type}:${constraints.oven_max_temp_c}`;
  const initialOvenKey = useRef(ovenKey);
  useEffect(() => {
    if (visible && ovenKey !== initialOvenKey.current) setVisible(false);
  }, [ovenKey, visible]);

  const close = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      /* senza storage la scheda torna alla prossima visita: innocuo */
    }
  }, []);
  const dismiss = useCallback(() => {
    close();
    onClosed?.();
  }, [close, onClosed]);

  if (!visible) return null;
  const fmt = createFormatter(cms.ui, bcp47);
  const body = t(cms.hero.onboardingBody, {
    oven: cms.ovenPresets[constraints.oven_type]?.name ?? constraints.oven_type,
    temp: fmt.celsius(constraints.oven_max_temp_c),
  });

  return (
    <Surface as="section" className="oven-first-notice" aria-labelledby="oven-first-notice-title">
      <Flame size={20} aria-hidden="true" className="oven-first-notice__icon" />
      <p id="oven-first-notice-title" className="type-label oven-first-notice__title">
        {cms.hero.onboardingEyebrow}
      </p>
      <p className="type-body-sm oven-first-notice__body">{body}</p>
      <footer className="oven-first-notice__actions">
        <CtaButton
          type="button"
          variant="secondary"
          elevated={false}
          className="oven-first-notice__cta"
          onClick={() => {
            close();
            onChooseOven();
          }}
        >
          {cms.hero.onboardingCta}
          <ChevronRight size={16} aria-hidden="true" />
        </CtaButton>
        <button type="button" className="oven-first-notice__dismiss" onClick={dismiss}>
          {cms.hero.onboardingDismiss}
        </button>
        <Link to="/profile" className="oven-first-notice__link" onClick={close}>
          {cms.hero.onboardingProfileCta}
        </Link>
      </footer>
    </Surface>
  );
}
