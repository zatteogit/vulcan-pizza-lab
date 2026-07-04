-- D1 schema for the AI debug overlay annotation registry.
-- One row per annotation; `data` holds the full JSON blob so the client shape
-- can evolve without migrations. `updated_at` drives last-write-wins upserts,
-- `deleted` is the tombstone flag (kept so deletions propagate across devices).
CREATE TABLE IF NOT EXISTS annotations (
  id         TEXT PRIMARY KEY,
  data       TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_annotations_updated ON annotations(updated_at);
