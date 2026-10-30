/** Shared photo library. Versions are immutable; publishing only moves a pointer. */
export interface PhotoVersion {
  id: string;
  slot: string;
  label: string;
  src: string;
  smallSrc: string;
  width: number;
  height: number;
  smallWidth: number;
  createdAt: number;
}
export interface MediaStore {
  active(): Promise<PhotoVersion[]>;
  library(): Promise<PhotoVersion[]>;
  find(id: string): Promise<PhotoVersion | null>;
  publish(slot: string, id: string, expected: string | null): Promise<boolean>;
}
export interface MediaActor { role: string }
export interface MediaDeps {
  store: MediaStore;
  actor(request: Request): Promise<MediaActor | null>;
}
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    "Content-Type": "application/json", "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}
export async function handleMediaRequest(request: Request, deps: MediaDeps): Promise<Response> {
  const path = new URL(request.url).pathname;
  if (path === "/api/media/active" && request.method === "GET") {
    return json({ photos: await deps.store.active() });
  }
  const actor = await deps.actor(request);
  if (!actor || !["admin", "editor"].includes(actor.role)) return json({ error: "Accesso riservato ad amministratori ed editor." }, 403);
  if (path === "/api/media/library" && request.method === "GET") {
    return json({ versions: await deps.store.library(), active: await deps.store.active() });
  }
  if (path === "/api/media/publish" && request.method === "POST") {
    if (request.headers.get("Origin") !== new URL(request.url).origin) return json({ error: "Origine non valida." }, 403);
    if (!request.headers.get("Content-Type")?.startsWith("application/json")) return json({ error: "Formato non valido." }, 415);
    if (Number(request.headers.get("Content-Length")) > 4096) return json({ error: "Richiesta troppo grande." }, 413);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Richiesta vuota." }, 400);
    let body = "";
    const decoder = new TextDecoder();
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); return json({ error: "Richiesta troppo grande." }, 413); }
      body += decoder.decode(value, { stream: true });
    }
    let data: Record<string, unknown>;
    try { data = JSON.parse(body); } catch { return json({ error: "Richiesta non valida." }, 400); }
    if (!data || typeof data.slot !== "string" || typeof data.id !== "string" || !(data.expected === null || typeof data.expected === "string")) return json({ error: "Versione non valida." }, 400);
    const version = await deps.store.find(data.id);
    if (!version || version.slot !== data.slot) return json({ error: "La foto non appartiene a questa scheda." }, 400);
    const saved = await deps.store.publish(data.slot, data.id, data.expected);
    return saved ? json({ photo: version }) : json({ error: "La foto è cambiata nel frattempo. Ricarica la libreria." }, 409);
  }
  return json({ error: "Operazione non disponibile." }, 405);
}
