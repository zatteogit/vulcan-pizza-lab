/* ═══ FW-19 (S10-A-16) — Un timer per ogni cottura ═══
 * «4 cotture da 75 secondi, gira a metà» aveva un solo countdown di 5 minuti
 * per tutto il blocco: chi ha la pala in mano doveva contare a mente. Qui
 * ogni infornata si avvia con un tocco, a metà arriva «gira» e alla fine
 * «sforna»; fra un giro e l'altro si ricorda il recupero del forno (ipotesi
 * del modello, nota bake-round-recovery). Lo stato vive nella vista: il
 * piano della pizzata non cambia. Variante (forno o olio) e rotazioni dello
 * stile decidono i testi: vedi bake-rounds-status.ts. */

import { Flame, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CtaButton } from "../../components/ds/index";
import { formatSeconds } from "../../i18n/format";
import { uiMessage } from "../../i18n/ui-messages";
import { useCms } from "../cms/cms-context";
import { roundStatus, roundsCtaState, type RoundPhase } from "./bake-rounds-status";

interface BakeRoundsTimerProps {
  rounds: number;
  /** Secondi di una cottura (stima del motore per il forno dell'utente). */
  roundSec: number;
  /** Secondi di recupero del forno fra due giri (ipotesi), se previsti. */
  recoverySec?: number;
  /** Rotazioni per cottura dello stile (0 = non girare). */
  turns?: number;
  /** Variante del passo: «fry» = frittura in olio. */
  variant?: string;
}

export function BakeRoundsTimer({ rounds, roundSec, recoverySec, turns = 1, variant }: BakeRoundsTimerProps) {
  const { bcp47 } = useCms();
  /** Giro in corso o appena finito (1-based); 0 = nessuno ancora. */
  const [round, setRound] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [, setTick] = useState(0);

  const elapsedSec = startedAt === null ? 0 : (Date.now() - startedAt) / 1000;
  const phase: RoundPhase = startedAt === null ? (round === 0 ? "idle" : "out") : elapsedSec >= roundSec ? "out" : "baking";

  useEffect(() => {
    if (phase !== "baking") return;
    const i = setInterval(() => setTick((n) => n + 1), 500);
    return () => clearInterval(i);
  }, [phase]);

  /* A fine cottura il timer si ferma: l'ultima infornata resta «sfornata». */
  useEffect(() => {
    if (startedAt !== null && elapsedSec >= roundSec) setStartedAt(null);
  }, [startedAt, elapsedSec, roundSec]);

  const allDone = round >= rounds && phase !== "baking";
  const cta = roundsCtaState(phase, allDone);
  const statusRef = useRef<HTMLParagraphElement>(null);
  /* A fine giri il pulsante sparisce: se aveva il focus (ora sul body), lo
     riceve lo stato «tutte sfornate», dentro la vista di cottura. */
  useEffect(() => {
    if (!allDone || round === 0) return;
    const active = typeof document !== "undefined" ? document.activeElement : null;
    if (!active || active === document.body) statusRef.current?.focus();
  }, [allDone, round]);
  const remainingSec = Math.max(0, Math.ceil(roundSec - elapsedSec));
  const nextRound = round + 1;
  const st = roundStatus({ phase, elapsedSec, roundSec, round, rounds, turns, variant });
  const turning = st.key === "turn" || st.key === "rotate";
  /* La frittura (pizza fritta, montanara) ha testi propri: niente forno. */
  const fry = variant === "fry";

  const status =
    st.key === "remaining"
      ? uiMessage(fry ? "cooking.rounds.fry.remaining" : "cooking.rounds.remaining", [formatSeconds(remainingSec, bcp47)])
      : st.key === "turn"
        ? uiMessage(fry ? "cooking.rounds.fry.turn" : "cooking.rounds.turn")
        : st.key === "rotate"
          ? uiMessage("cooking.rounds.rotate", [st.turnIndex ?? 1, st.turnCount ?? turns])
          : st.key === "allDone"
            ? uiMessage(fry ? "cooking.rounds.fry.allDone" : "cooking.rounds.allDone", [rounds])
            : st.key === "out"
              ? uiMessage(fry ? "cooking.rounds.fry.out" : "cooking.rounds.out")
              : uiMessage(fry ? "cooking.rounds.fry.ready" : "cooking.rounds.ready", [formatSeconds(roundSec, bcp47)]);

  /* Revisione ondata 2 (come PhaseCountdown, FW-13): il conto alla rovescia
     cambia ogni secondo e non sta in una regione live, altrimenti il lettore di
     schermo annuncia un numero al secondo e copre «gira» e «sforna». La regione
     live cambia testo solo quando cambia lo stato: l'inizio della cottura si
     annuncia una volta, con la durata. */
  const announcement =
    st.key === "remaining"
      ? uiMessage(fry ? "cooking.rounds.fry.started" : "cooking.rounds.started", [round, rounds, formatSeconds(roundSec, bcp47)])
      : status;
  /* Dopo «gira» il tempo rimasto resta visibile: si sa quanto manca a «sforna». */
  const clock =
    phase === "baking" && turning
      ? uiMessage(fry ? "cooking.rounds.fry.remaining" : "cooking.rounds.remaining", [formatSeconds(remainingSec, bcp47)])
      : null;

  return (
    <section className="cook-rounds" data-phase={phase} aria-label={uiMessage(fry ? "cooking.rounds.fry.label" : "cooking.rounds.label")}>
      <p className="cook-rounds__count type-numeric">
        {uiMessage(fry ? "cooking.rounds.fry.progress" : "cooking.rounds.progress", [Math.min(Math.max(round, 1), rounds), rounds])}
      </p>
      <p ref={statusRef} tabIndex={-1} className="cook-rounds__status type-numeric">
        {turning && <RotateCw size={18} aria-hidden="true" className="cook-rounds__icon" />}
        {status}
      </p>
      {clock && <p className="cook-rounds__clock type-numeric">{clock}</p>}
      <p className="sr-only" role="status">{announcement}</p>
      {phase === "out" && !allDone && recoverySec ? (
        <p className="cook-rounds__hint">
          {uiMessage("cooking.rounds.recovery", [formatSeconds(recoverySec, bcp47)])}
        </p>
      ) : null}
      {cta !== "hidden" && (
        <CtaButton
          variant="secondary"
          aria-disabled={cta === "waiting" ? true : undefined}
          onClick={() => {
            if (cta !== "enabled") return;
            setRound(nextRound);
            setStartedAt(Date.now());
          }}
          className="cook-rounds__cta"
        >
          <Flame size={18} aria-hidden="true" />
          {uiMessage(fry ? "cooking.rounds.fry.start" : "cooking.rounds.start", [nextRound, rounds])}
        </CtaButton>
      )}
    </section>
  );
}
