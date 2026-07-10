import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Annotation } from "./annotation-types";
import {
  activeAnnotations,
  mergeRegistries,
  nextIndex,
  purgeExpiredTombstones,
} from "./merge-registries";
import { fetchRemote, isRemoteConfigured, pushRemote } from "./api-sync";

const LS_KEY = "vulcan_debug_registry";
const FILE_ENDPOINT = "/api/save-annotations";
const PUSH_DEBOUNCE_MS = 800;
const POLL_INTERVAL_MS = 20000;

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
  // Dev-only Vite endpoint that keeps vulcan-debug-registry.json live for the
  // "risolvi i commenti" workflow; silently a no-op in production/preview.
  fetch(FILE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list, null, 2),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Single source of truth for the overlay's annotations. Reconciles three
 * storage layers — localStorage (instant/offline cache), the dev file endpoint,
 * and the shared Cloudflare/D1 remote — with last-write-wins-by-id, and fans
 * every mutation back out. Polls the remote so pins made in another environment
 * appear without a reload. Callers see only live annotations.
 */
export function useAnnotations() {
  const [registry, setRegistry] = useState<Annotation[]>(() => readLocal());
  const [remoteConfigured] = useState(() => isRemoteConfigured());
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  const registryRef = useRef(registry);
  registryRef.current = registry;
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPush = useRef(false);

  const annotations = useMemo(() => activeAnnotations(registry), [registry]);

  /* ── Adopt a reconciled registry into state + local cache ── */
  const adopt = useCallback((next: Annotation[]) => {
    const pruned = purgeExpiredTombstones(next);
    setRegistry(pruned);
    writeLocal(pruned);
    return pruned;
  }, []);

  /* ── Flush the current registry to the writable layers ── */
  const flushPush = useCallback(() => {
    if (!pendingPush.current) return;
    pendingPush.current = false;
    const current = registryRef.current;
    pushFileRegistry(current);
    if (isRemoteConfigured()) {
      void pushRemote(current).then((canonical) => {
        if (canonical) {
          const merged = mergeRegistries(canonical, registryRef.current);
          adopt(merged);
          setLastSync(Date.now());
        }
      });
    }
  }, [adopt]);

  /* ── Persist a new registry (local now, remote debounced) ── */
  const persist = useCallback(
    (next: Annotation[]) => {
      const pruned = adopt(next);
      pendingPush.current = true;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(flushPush, PUSH_DEBOUNCE_MS);
      return pruned;
    },
    [adopt, flushPush],
  );

  /* ── Pull remote + file and reconcile ── */
  const refresh = useCallback(async () => {
    setSyncing(true);
    const [file, remote] = await Promise.all([
      fetchFileRegistry(),
      isRemoteConfigured() ? fetchRemote() : Promise.resolve(null),
    ]);
    // Local last so a mutation made while fetching isn't lost.
    const merged = mergeRegistries(remote, file, readLocal());
    const adopted = adopt(merged);
    // Backfill whatever layer was stale.
    if (file) pushFileRegistry(adopted);
    if (remote !== null) void pushRemote(adopted);
    setLastSync(Date.now());
    setSyncing(false);
  }, [adopt]);

  /* ── Initial reconciliation ── */
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Poll the remote for cross-environment changes ── */
  useEffect(() => {
    if (!remoteConfigured) return;
    const interval = setInterval(() => {
      void (async () => {
        const remote = await fetchRemote();
        if (remote) {
          adopt(mergeRegistries(remote, registryRef.current));
          setLastSync(Date.now());
        }
      })();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [remoteConfigured, adopt]);

  /* ── Poll the local file registry in dev mode ── */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const interval = setInterval(() => {
      void (async () => {
        const file = await fetchFileRegistry();
        if (file) {
          adopt(mergeRegistries(file, registryRef.current));
          setLastSync(Date.now());
        }
      })();
    }, 4000); // Poll local file registry every 4 seconds in dev mode for responsive sync!
    return () => clearInterval(interval);
  }, [adopt]);

  /* ── Flush pending writes before the tab goes away ── */
  useEffect(() => {
    const onHide = () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      flushPush();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });
    return () => {
      window.removeEventListener("pagehide", onHide);
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [flushPush]);

  /* ── Mutators ── */

  const upsert = useCallback((anno: Annotation) => {
    const prev = registryRef.current;
    const existing = prev.find((a) => a.id === anno.id);
    const merged: Annotation = {
      ...anno,
      index: existing?.index ?? anno.index ?? nextIndex(prev),
      updatedAt: Date.now(),
      deleted: false,
    };
    persist(existing ? prev.map((a) => (a.id === anno.id ? merged : a)) : [...prev, merged]);
  }, [persist]);

  const remove = useCallback((id: string) => {
    persist(
      registryRef.current.map((a) =>
        a.id === id ? { ...a, deleted: true, updatedAt: Date.now() } : a,
      ),
    );
  }, [persist]);

  const setResolved = useCallback((id: string, resolved: boolean) => {
    persist(
      registryRef.current.map((a) =>
        a.id === id ? { ...a, resolved, updatedAt: Date.now() } : a,
      ),
    );
  }, [persist]);

  const clearAll = useCallback(() => {
    const now = Date.now();
    persist(registryRef.current.map((a) => ({ ...a, deleted: true, updatedAt: now })));
  }, [persist]);

  return {
    annotations,
    registry,
    upsert,
    remove,
    setResolved,
    clearAll,
    remoteConfigured,
    syncing,
    lastSync,
    refresh,
  };
}
