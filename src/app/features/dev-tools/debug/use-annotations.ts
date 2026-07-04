import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Annotation } from "./annotation-types";
import {
  activeAnnotations,
  mergeRegistries,
  nextIndex,
  purgeExpiredTombstones,
} from "./merge-registries";
import {
  fetchGistRegistry,
  loadGistConfig,
  pushGistRegistry,
  type GistConfig,
} from "./gist-sync";

const LS_KEY = "vulcan_debug_registry";
const FILE_ENDPOINT = "/api/save-annotations";
const PUSH_DEBOUNCE_MS = 800;

function readLocal(): Annotation[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function writeLocal(list: Annotation[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {}
}

async function fetchFileRegistry(): Promise<Annotation[] | null> {
  try {
    const res = await fetch(FILE_ENDPOINT);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function pushFileRegistry(list: Annotation[]) {
  // Dev-only endpoint; silently a no-op in production/preview.
  fetch(FILE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list, null, 2),
  }).catch(() => {});
}

/**
 * Single source of truth for the overlay's annotations. Reconciles three
 * storage layers (localStorage, the dev file endpoint, an optional gist) with
 * last-write-wins-by-id, and fans every mutation back out to all three.
 * Callers see only live annotations; tombstones are handled internally.
 */
export function useAnnotations() {
  const [registry, setRegistry] = useState<Annotation[]>(() => readLocal());
  const gistConfigRef = useRef<GistConfig | null>(loadGistConfig());
  const [gistConfigured, setGistConfigured] = useState(() => gistConfigRef.current !== null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const annotations = useMemo(() => activeAnnotations(registry), [registry]);

  /* ── Persist a new registry to every layer (localStorage now, remote debounced) ── */
  const persist = useCallback((next: Annotation[]) => {
    const pruned = purgeExpiredTombstones(next);
    setRegistry(pruned);
    writeLocal(pruned);

    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      pushFileRegistry(pruned);
      const cfg = gistConfigRef.current;
      if (cfg) void pushGistRegistry(cfg, pruned);
    }, PUSH_DEBOUNCE_MS);
  }, []);

  /* ── Initial reconciliation across layers ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [file, gist] = await Promise.all([
        fetchFileRegistry(),
        gistConfigRef.current ? fetchGistRegistry(gistConfigRef.current) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      // Local last so a mutation made before the fetch resolved isn't lost.
      const merged = purgeExpiredTombstones(mergeRegistries(gist, file, readLocal()));
      setRegistry(merged);
      writeLocal(merged);
      // Backfill the merged view to any writable layer that was stale.
      if (file) pushFileRegistry(merged);
      if (gist && gistConfigRef.current) void pushGistRegistry(gistConfigRef.current, merged);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
  }, []);

  /* ── Mutators ── */

  /** Insert or update an annotation, stamping sync metadata. */
  const upsert = useCallback((anno: Annotation) => {
    setRegistry((prev) => {
      const existing = prev.find((a) => a.id === anno.id);
      const merged: Annotation = {
        ...anno,
        index: existing?.index ?? anno.index ?? nextIndex(prev),
        updatedAt: Date.now(),
        deleted: false,
      };
      const next = existing
        ? prev.map((a) => (a.id === anno.id ? merged : a))
        : [...prev, merged];
      persist(next);
      return purgeExpiredTombstones(next);
    });
  }, [persist]);

  /** Tombstone an annotation so the deletion propagates before being purged. */
  const remove = useCallback((id: string) => {
    setRegistry((prev) => {
      const next = prev.map((a) =>
        a.id === id ? { ...a, deleted: true, updatedAt: Date.now() } : a,
      );
      persist(next);
      return purgeExpiredTombstones(next);
    });
  }, [persist]);

  /** Toggle the "resolved" flag (used by the fix workflow instead of deleting). */
  const setResolved = useCallback((id: string, resolved: boolean) => {
    setRegistry((prev) => {
      const next = prev.map((a) =>
        a.id === id ? { ...a, resolved, updatedAt: Date.now() } : a,
      );
      persist(next);
      return purgeExpiredTombstones(next);
    });
  }, [persist]);

  /** Tombstone everything at once. */
  const clearAll = useCallback(() => {
    setRegistry((prev) => {
      const now = Date.now();
      const next = prev.map((a) => ({ ...a, deleted: true, updatedAt: now }));
      persist(next);
      return purgeExpiredTombstones(next);
    });
  }, [persist]);

  /** Wire up (or tear down) gist sync at runtime and reconcile immediately. */
  const configureGist = useCallback((cfg: GistConfig | null) => {
    gistConfigRef.current = cfg;
    setGistConfigured(cfg !== null);
    if (!cfg) return;
    (async () => {
      const gist = await fetchGistRegistry(cfg);
      const merged = purgeExpiredTombstones(mergeRegistries(gist, readLocal()));
      setRegistry(merged);
      writeLocal(merged);
      void pushGistRegistry(cfg, merged);
    })();
  }, []);

  return {
    annotations,
    registry,
    upsert,
    remove,
    setResolved,
    clearAll,
    gistConfigured,
    configureGist,
  };
}
