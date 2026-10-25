import { useEffect, useRef, useState } from "react";

export type LiquidNavState = {
  hidden: boolean;
  /** Mobile dock stays visible and drops labels while reading downwards. */
  compact: boolean;
  /** Fondo pagina raggiunto: il dock in basso si mostra, ma l'avatar in alto
   *  NON deve ricomparire sopra i contenuti (audit lug 2026). */
  nearBottom: boolean;
  scrolled: boolean;
};

export const NAV_RESYNC_EVENT = "vulcan:nav-resync";

/* ═══ Barre dinamiche (feedback giugno 2026, stile liquid glass) ═══
   La chrome fluttua sopra al contenuto: si ritira quando leggi, riemerge
   appena risali e cambia densità quando c'è contenuto che scorre sotto. */
export function useLiquidNavState(threshold = 28, enabled = true): LiquidNavState {
  const [state, setState] = useState<LiquidNavState>({
    hidden: false,
    compact: false,
    scrolled: false,
    nearBottom: false,
  });
  const stateRef = useRef(state);
  useEffect(() => {
    if (!enabled) return;
    const updateState = (next: LiquidNavState) => {
      const prev = stateRef.current;
      if (prev.hidden === next.hidden && prev.compact === next.compact &&
        prev.scrolled === next.scrolled && prev.nearBottom === next.nearBottom) return;
      stateRef.current = next;
      setState(next);
    };
    let lastY = window.scrollY;
    let acc = 0;
    let frame = 0;

    /* Massimo scroll reale della pagina. Su Safari iOS lo scrollY va oltre
       questo valore (o sotto 0 in cima) durante il rubber-band: lo usiamo per
       clampare ed evitare che l'elastico generi un dy fantasma. */
    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const readScroll = () => {
      frame = 0;
      /* Clamp anti rubber-band iOS: senza questo, l'overscroll in cima/fondo
         produce delta spurii che fanno lampeggiare il dock. */
      const y = Math.min(Math.max(window.scrollY, 0), maxScroll());
      const dy = y - lastY;
      lastY = y;
      const isScrolled = y > 24;
      const nearBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 120;

      if (Math.abs(dy) >= 0.5) {
        acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy;
      }

      const prev = stateRef.current;
      const retract = y > 140 && acc > threshold;
      const reveal = acc < -threshold * 0.72;
      const compact = y < 96 ? false : retract ? true : reveal ? false : prev.compact;
      // Keep the existing behaviour for the avatar/cooking widget. The dock
      // remains compact at the bottom until the user actually scrolls up.
      const hidden = y < 96 || nearBottom ? false : retract ? true : reveal ? false : prev.hidden;
      if (y < 96 || compact !== prev.compact || hidden !== prev.hidden) acc = 0;
      updateState({ hidden, compact, scrolled: isScrolled, nearBottom });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(readScroll);
    };

    /* Comparsa/scomparsa della barra indirizzi Safari iOS: emette resize (e
       visualViewport resize) senza uno scroll reale dell'utente. La trattiamo
       come "mostra il dock" e ri-sincronizziamo lastY, così la barra che
       ricompare non lascia il dock nascosto né provoca un flip spurio. */
    /* U-5: un salto di scroll fatto dall'app (ritorno da «Annulla» della
       ricerca) non è lettura: si riallinea senza ritirare il dock. */
    const onResync = () => {
      lastY = Math.min(Math.max(window.scrollY, 0), maxScroll());
      acc = 0;
      updateState({ ...stateRef.current, hidden: false, compact: false });
    };

    const onViewportChange = () => {
      lastY = Math.min(Math.max(window.scrollY, 0), maxScroll());
      acc = 0;
      updateState({ ...stateRef.current, hidden: false });
    };

    /* U-10 (F02): dock, avatar e widget di cottura si ritirano allo scroll ma
       restano nella sequenza del Tab. Quando il focus ci entra ricompaiono,
       così chi usa la tastiera non finisce su controlli invisibili. */
    const onFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest(".app-shell-dock, .section-tabs-dock, .app-shell-profile, .cook-widget")) return;
      // Pointer taps must not move their target mid-press. Keyboard focus
      // reveals labels; opening search expands the dock explicitly.
      if (event.target.closest(".app-shell-dock, .section-tabs-dock") &&
        !event.target.matches(":focus-visible, input")) return;
      acc = 0;
      updateState({ ...stateRef.current, hidden: false, compact: false, nearBottom: false });
    };

    onScroll();
    window.addEventListener(NAV_RESYNC_EVENT, onResync);
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onViewportChange, { passive: true });
    window.visualViewport?.addEventListener("resize", onViewportChange);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener(NAV_RESYNC_EVENT, onResync);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
    };
  }, [threshold, enabled]);
  return state;
}

