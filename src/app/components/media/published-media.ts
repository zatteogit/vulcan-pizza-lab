import { useSyncExternalStore } from "react";
import { MEDIA_SOURCE_SLOTS } from "../../data/media-source-map";

interface PublishedPhoto {
  id: string; slot: string; src: string; smallSrc: string;
  width: number; height: number; smallWidth: number;
}
let photos = new Map<string, PublishedPhoto>();
let revision = 0;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => revision;
export function usePublishedMediaRevision() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
/** Same-origin only. A network failure leaves all bundled fallbacks usable. */
export async function refreshPublishedMedia(): Promise<void> {
  try {
    const response = await fetch("/api/media/active", { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json() as { photos?: PublishedPhoto[] };
    if (!Array.isArray(data.photos)) return;
    const safe = /^\/media\/photos\/[a-f0-9]{64}\.webp$/;
    photos = new Map(data.photos.filter(p => typeof p.slot === "string" && safe.test(p.src) && safe.test(p.smallSrc) && p.width > 0 && p.height > 0 && p.smallWidth > 0).map(p => [p.slot, p]));
    revision++;
    for (const listener of listeners) listener();
  } catch { /* Offline or an edition without shared photos: keep the fallbacks. */ }
}
export function getPublishedPhoto(src: string | undefined): PublishedPhoto | undefined {
  const slot = src ? MEDIA_SOURCE_SLOTS.get(src) : undefined;
  return slot ? photos.get(slot) : undefined;
}
