import { describe, expect, it, vi } from "vitest";

/* Budget D-059 (31/10/2026): METHOD_MESSAGES_IT si riempie alla
 * registrazione (server, CmsProvider, setup dei test). Un dato che lo legge
 * al caricamento del modulo prenderebbe `undefined` sul server, dove i moduli
 * si caricano prima della registrazione: lì serve un getter. Qui si caricano
 * i dati con il registro vuoto, poi si registra l'italiano, e ogni messaggio
 * del motore scritto nei dati deve avere il suo testo. */

function engineMessagesIn(value: unknown, path: string, out: [string, unknown][], seen = new Set<unknown>()): void {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  const record = value as Record<string, unknown>;
  if (typeof record.key === "string" && "fallback" in record) out.push([`${path} (${record.key})`, record.fallback]);
  for (const [k, v] of Object.entries(record)) engineMessagesIn(v, `${path}.${k}`, out, seen);
}

describe("messaggi del motore nei dati", () => {
  it("nessun dato legge i testi di riserva al caricamento del modulo", async () => {
    vi.resetModules();
    const messages = await import("./method-messages");
    for (const key of Object.keys(messages.METHOD_MESSAGES_IT)) delete messages.METHOD_MESSAGES_IT[key];
    const modules = {
      styles: await import("../domain/styles-db"),
      toppings: await import("./topping-library"),
      versions: await import("./style-versions"),
      interpretations: await import("./interpretation-library"),
    };
    const { METHOD_MESSAGES_IT_TEXT } = await import("./method-messages.it");
    messages.registerMethodMessages(METHOD_MESSAGES_IT_TEXT);
    const found: [string, unknown][] = [];
    for (const [name, mod] of Object.entries(modules)) engineMessagesIn(mod, name, found);
    expect(found.length).toBeGreaterThan(0);
    expect(found.filter(([, fallback]) => typeof fallback !== "string" || fallback === "")).toEqual([]);
    vi.resetModules();
  });
});
