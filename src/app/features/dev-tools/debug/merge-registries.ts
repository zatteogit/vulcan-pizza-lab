import type { Annotation } from "./annotation-types";

/* ═══ REGISTRY MERGE (LAST-WRITE-WINS PER id) ═══
 *
 * The overlay writes the whole array to several places (localStorage, the dev
 * file endpoint, an optional GitHub gist). Two devices editing the same
 * registry would otherwise clobber each other on the next full-array write, so
 * every mutation stamps `updatedAt` and deletions leave a `deleted` tombstone
 * instead of dropping the row. On load we reconcile the layers by `id`, keeping
 * the most recently touched copy of each annotation.
 */

const TOMBSTONE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function stamp(a: Annotation): number {
  return typeof a.updatedAt === "number" ? a.updatedAt : 0;
}

/**
 * Merge any number of registry snapshots into one canonical list.
 * For each `id` the entry with the highest `updatedAt` wins; ties keep the
 * copy seen first (earlier source argument), so pass the freshest source last.
 */
export function mergeRegistries(...sources: (Annotation[] | null | undefined)[]): Annotation[] {
  const byId = new Map<string, Annotation>();

  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const anno of source) {
      if (!anno || typeof anno.id !== "string") continue;
      const existing = byId.get(anno.id);
      if (!existing || stamp(anno) > stamp(existing)) {
        byId.set(anno.id, anno);
      }
    }
  }

  return Array.from(byId.values());
}

/**
 * Drop tombstones that have been deleted for longer than the TTL. Anything
 * still live (or recently deleted) is kept so the deletion keeps propagating.
 */
export function purgeExpiredTombstones(list: Annotation[], now: number = Date.now()): Annotation[] {
  return list.filter((a) => {
    if (!a.deleted) return true;
    return now - stamp(a) < TOMBSTONE_TTL_MS;
  });
}

/**
 * The visible working set: live annotations only, ordered by their pin index
 * (falling back to insertion order) so numbering is stable across reloads.
 */
export function activeAnnotations(list: Annotation[]): Annotation[] {
  return list
    .filter((a) => !a.deleted)
    .sort((a, b) => (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER));
}

/** Next pin index, ignoring tombstones. */
export function nextIndex(list: Annotation[]): number {
  return list.reduce((max, a) => Math.max(max, a.index ?? 0), 0) + 1;
}
