-- Immutable photographs live at content-addressed /media/photos URLs.
-- No delete endpoint: selecting a photo never removes a previous version.
CREATE TABLE IF NOT EXISTS media_versions (
  id TEXT PRIMARY KEY, slot TEXT NOT NULL, label TEXT NOT NULL,
  src TEXT NOT NULL, small_src TEXT NOT NULL,
  width INTEGER NOT NULL, height INTEGER NOT NULL, small_width INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(slot,id)
);
CREATE INDEX IF NOT EXISTS idx_media_versions_slot ON media_versions(slot,created_at);
CREATE TABLE IF NOT EXISTS media_publications (
  slot TEXT PRIMARY KEY, version_id TEXT NOT NULL, updated_at INTEGER NOT NULL,
  FOREIGN KEY(slot,version_id) REFERENCES media_versions(slot,id)
);
