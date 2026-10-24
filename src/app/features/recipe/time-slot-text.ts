import type { TimeSlot } from "../../domain/pizza-engine";
import type { CmsContent } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";

/* ═══ Testi degli slot del pasto, per lingua (M-2) ═══
 * Il motore dà ore (al quarto d'ora per difetto), pasto e giorno; qui si
 * compongono etichetta e sottotitolo nella lingua attiva. Prima i giorni della
 * settimana e «Nessuna preferenza» restavano in italiano in tutte le lingue e il
 * sottotitolo di «Stasera» era fisso («4-6 ore») a qualunque ora del giorno. */

export interface TimeSlotText {
  label: string;
  sublabel: string;
}

function capitalize(text: string, bcp47: string): string {
  return text.charAt(0).toLocaleUpperCase(bcp47) + text.slice(1);
}

export function timeSlotText(
  slot: TimeSlot,
  cms: CmsContent,
  bcp47: string,
  now: Date = new Date(),
): TimeSlotText {
  const fmt = createFormatter(cms.ui, bcp47);
  if (slot.id === "no_preference") {
    return { label: cms.ui.slotNoPreference, sublabel: cms.ui.slotNoPreferenceSub };
  }
  const sublabel = fmt.durationShort(slot.hours);
  if (slot.targetAt !== undefined) {
    const when = new Date(slot.targetAt).toLocaleString(bcp47, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    return { label: capitalize(when, bcp47), sublabel };
  }
  if (slot.dayOffset === undefined || slot.dayOffset <= 1) {
    return { label: cms.timeSlots[slot.id]?.label ?? slot.label, sublabel };
  }
  const day = new Date(now);
  day.setDate(day.getDate() + slot.dayOffset);
  const weekday = day.toLocaleDateString(bcp47, { weekday: "long" });
  const template = slot.meal === "dinner" ? cms.ui.slotWeekdayDinner : cms.ui.slotWeekdayLunch;
  return { label: capitalize(t(template, { day: weekday }), bcp47), sublabel };
}
