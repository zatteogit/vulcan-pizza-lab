/* ═══ FW-19 (S10-A-16) — Un timer per ogni cottura ═══
 * «4 cotture da 75 secondi, gira a metà» aveva un solo countdown di 5 minuti
 * per tutto il blocco: chi ha la pala in mano doveva contare a mente. Qui
 * ogni infornata si avvia con un tocco, a metà arriva «gira» e alla fine
 * «sforna»; fra un giro e l'altro si ricorda il recupero del forno (ipotesi
 * del modello, nota bake-round-recovery). Lo stato vive nella vista: il
 * piano della pizzata non cambia. */

import { Flame, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { CtaButton } from "../../components/ds/index";
import { formatSeconds } from "../../i18n/format";
import { uiMessage } from "../../i18n/ui-messages";
import { useCms } from "../cms/cms-context";

interface BakeRoundsTimerProps {
  rounds: number;
  /** Secondi di una cottura (stima del motore per il forno dell'utente). */
  roundSec: number;
  /** Secondi di recupero del forno fra due giri (ipotesi), se previsti. */
  recoverySec?: number;
}

type RoundPhase = "idle" | "baking" | "out";

export function BakeRoundsTimer({ rounds, roundSec, recoverySec }: BakeRoundsTimerProps) {
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
  const remainingSec = Math.max(0, Math.ceil(roundSec - elapsedSec));
  const halfway = phase === "baking" && elapsedSec >= roundSec / 2;
  const nextRound = round + 1;

  const status =
    phase === "baking"
      ? halfway
        ? uiMessage("cooking.rounds.turn")
        : uiMessage("cooking.rounds.remaining", [formatSeconds(remainingSec, bcp47)])
      : allDone
        ? uiMessage("cooking.rounds.allDone", [rounds])
        : phase === "out"
          ? uiMessage("cooking.rounds.out")
          : uiMessage("cooking.rounds.ready", [formatSeconds(roundSec, bcp47)]);

  return (
    <section className="cook-rounds" data-phase={phase} aria-label={uiMessage("cooking.rounds.label")}>
      <p className="cook-rounds__count type-numeric">
        {uiMessage("cooking.rounds.progress", [Math.min(Math.max(round, 1), rounds), rounds])}
      </p>
      <p className="cook-rounds__status type-numeric" role="status" aria-live="polite">
        {halfway && <RotateCw size={18} aria-hidden="true" className="cook-rounds__icon" />}
        {status}
      </p>
      {phase === "out" && !allDone && recoverySec ? (
        <p className="cook-rounds__hint">
          {uiMessage("cooking.rounds.recovery", [formatSeconds(recoverySec, bcp47)])}
        </p>
      ) : null}
      {!allDone && phase !== "baking" && (
        <CtaButton
          variant="secondary"
          onClick={() => {
            setRound(nextRound);
            setStartedAt(Date.now());
          }}
          className="cook-rounds__cta"
        >
          <Flame size={18} aria-hidden="true" />
          {uiMessage("cooking.rounds.start", [nextRound, rounds])}
        </CtaButton>
      )}
    </section>
  );
}
