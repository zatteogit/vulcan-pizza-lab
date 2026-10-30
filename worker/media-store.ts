import type { MediaStore, PhotoVersion } from "../src/server/media/handler";

interface Statement {
  bind(...values: unknown[]): Statement;
  all(): Promise<{ results?: Record<string, unknown>[] }>;
  run(): Promise<unknown>;
}
interface Database { prepare(sql: string): Statement }
function photo(row: Record<string, unknown>): PhotoVersion {
  return { id: String(row.id), slot: String(row.slot), label: String(row.label),
    src: String(row.src), smallSrc: String(row.small_src), width: Number(row.width),
    height: Number(row.height), smallWidth: Number(row.small_width), createdAt: Number(row.created_at) };
}
const COLUMNS = "v.id,v.slot,v.label,v.src,v.small_src,v.width,v.height,v.small_width,v.created_at";
export function mediaStore(db: Database): MediaStore {
  return {
    async active() {
      const { results } = await db.prepare(`SELECT ${COLUMNS} FROM media_versions v JOIN media_publications p ON p.version_id=v.id AND p.slot=v.slot ORDER BY v.slot`).all();
      return (results ?? []).map(photo);
    },
    async library() {
      const { results } = await db.prepare(`SELECT ${COLUMNS} FROM media_versions v ORDER BY v.slot,v.created_at DESC,v.id`).all();
      return (results ?? []).map(photo);
    },
    async find(id) {
      const { results } = await db.prepare(`SELECT ${COLUMNS} FROM media_versions v WHERE v.id=?1`).bind(id).all();
      return results?.[0] ? photo(results[0]) : null;
    },
    async publish(slot, id, expected) {
      // Compare-and-swap: an older CMS tab cannot overwrite a newer decision.
      const { results } = await db.prepare("INSERT INTO media_publications (slot,version_id,updated_at) SELECT ?1,?2,?3 WHERE ?4 IS NULL OR EXISTS (SELECT 1 FROM media_publications WHERE slot=?1 AND version_id IS ?4) ON CONFLICT(slot) DO UPDATE SET version_id=excluded.version_id,updated_at=excluded.updated_at WHERE media_publications.version_id IS ?4 RETURNING slot")
        .bind(slot, id, Date.now(), expected).all();
      return Boolean(results?.length);
    },
  };
}
