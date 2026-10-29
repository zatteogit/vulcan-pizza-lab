import { describe, expect, it } from "vitest";
import worker from "./index";

/* D-061: le rotte della voce nel Worker. /api/voice e /alexa sono del Worker
   (run_worker_first), non del fallback della SPA; nei Worker di test
   (REQUIRE_ACCESS=1) senza Cloudflare Access rispondono 403 come il resto. */

const assets = {
  async fetch() {
    return new Response("<!doctype html><title>SPA</title>", { status: 200, headers: { "content-type": "text/html" } });
  },
};

function call(path: string, env: Record<string, unknown> = {}, init?: RequestInit) {
  return worker.fetch(new Request(`https://vulcan-pizza-lab.zatteo.workers.dev${path}`, init), { ASSETS: assets, ...env } as never);
}

describe("Worker: rotte della voce", () => {
  it("/api/voice risponde con la voce, non con la SPA", async () => {
    const res = await call(`/api/voice?q=${encodeURIComponent("cos'è la biga")}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(await res.text()).toMatch(/^Biga\./);
  });

  it("/alexa senza ALEXA_SKILL_ID rifiuta tutto con 400", async () => {
    const res = await call("/alexa", {}, { method: "POST", body: "{}" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "skill_id_missing" });
  });

  it("/alexa con l'ID configurato ma senza firma: 400", async () => {
    const res = await call("/alexa", { ALEXA_SKILL_ID: "amzn1.ask.skill.x" }, { method: "POST", body: "{}" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "cert_url_invalid" });
  });

  it("nei Worker di test senza Cloudflare Access: 403", async () => {
    for (const path of ["/api/voice?q=aiuto", "/alexa"]) {
      expect((await call(path, { REQUIRE_ACCESS: "1" })).status, path).toBe(403);
    }
  });

  it("le altre rotte restano della SPA", async () => {
    const res = await call("/recipe/napoletana_stg");
    expect(await res.text()).toContain("SPA");
  });
});
