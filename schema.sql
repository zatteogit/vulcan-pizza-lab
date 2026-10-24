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

-- Global theme shared by every visitor (`/api/config`, development only:
-- the Worker answers 404 in production). Created here rather than on each
-- request; the Worker no longer runs DDL.
CREATE TABLE IF NOT EXISTS config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- D-046 / D-047: accesso e ruoli. Solo i dati minimi: id del provider,
-- email verificata, nome, ruolo. Le sessioni conservano l'impronta SHA-256
-- del token (mai il token) e scadono (30 giorni utente, 4 ore demo).
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  name       TEXT,
  role       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT,
  role       TEXT NOT NULL,
  email      TEXT,
  name       TEXT,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
