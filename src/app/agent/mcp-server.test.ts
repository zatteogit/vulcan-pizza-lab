import { describe, expect, it } from "vitest";
import { handleMcpBody, handleMcpMessage } from "./mcp-server";

/* D-049: il server MCP risponde come chiede il protocollo e i numeri sono
   quelli del motore. */

function call(name: string, args: Record<string, unknown> = {}) {
  const res = handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  if (!res || !("result" in res)) throw new Error("expected a result");
  return res.result as { content: { text: string }[]; structuredContent?: Record<string, unknown>; isError: boolean };
}

describe("server MCP", () => {
  it("initialize dichiara gli strumenti e la versione chiesta", () => {
    const res = handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } });
    expect(res && "result" in res && (res.result as { protocolVersion: string }).protocolVersion).toBe("2025-03-26");
  });

  it("tools/list elenca i cinque strumenti in sola lettura", () => {
    const res = handleMcpMessage({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    const tools = (res && "result" in res ? (res.result as { tools: { name: string; annotations: { readOnlyHint: boolean } }[] }).tools : []);
    expect(tools.map((t) => t.name)).toEqual(["list_styles", "get_style", "recommend_styles", "generate_recipe", "glossary"]);
    expect(tools.every((t) => t.annotations.readOnlyHint)).toBe(true);
  });

  it("le notifiche non hanno risposta (202)", () => {
    expect(handleMcpBody(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })).status).toBe(202);
  });

  it("JSON non valido → errore di parsing", () => {
    expect(handleMcpBody("{").status).toBe(400);
  });

  it("generate_recipe dà grammi e passi della napoletana", () => {
    const result = call("generate_recipe", { style_id: "napoletana_stg", oven_type: "wood", oven_max_temp_c: 485, dough_balls: 4 });
    expect(result.isError).toBe(false);
    const data = result.structuredContent as { ingredients: { name: string; grams: number }[]; steps: unknown[]; outcome: string };
    expect(data.ingredients.find((i) => i.name === "flour")?.grams).toBeGreaterThan(500);
    expect(data.steps.length).toBeGreaterThan(3);
    expect(data.outcome).not.toBe("not_feasible");
  });

  it("un input sbagliato torna come risultato con isError, non come errore di rete", () => {
    const result = call("generate_recipe", { style_id: "non_esiste" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("list_styles");
  });

  it("recommend_styles usa la stessa compatibilità dell'app", () => {
    const result = call("recommend_styles", { oven_type: "home", oven_max_temp_c: 250, limit: 3 });
    const styles = (result.structuredContent as { styles: { compatibility: number; compatibility_best: number }[] }).styles;
    expect(styles).toHaveLength(3);
    for (const s of styles) expect(s.compatibility_best).toBeGreaterThanOrEqual(s.compatibility);
  });

  it("glossary in inglese", () => {
    const result = call("glossary", { term: "biga", lang: "en" });
    expect(result.content[0].text).toMatch(/pre-dough|pre-ferment/i);
  });

  it("recommend_styles ordina per compatibilità e accetta un modello di forno", () => {
    const result = call("recommend_styles", { oven_model: "Koda 16", limit: 5 });
    const data = result.structuredContent as { constraints: { oven_type: string; oven_max_temp_c: number }; styles: { compatibility: number }[] };
    expect(data.constraints.oven_type).toBe("gas_pizza");
    expect(data.constraints.oven_max_temp_c).toBe(500);
    const scores = data.styles.map((s) => s.compatibility);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("il limite tiene i più compatibili, non i primi del motore", () => {
    const top = (limit: number) =>
      (call("recommend_styles", { oven_model: "Koda 16", limit }).structuredContent as { styles: { id: string }[] }).styles.map((s) => s.id);
    expect(top(3)).toEqual(top(30).slice(0, 3));
  });

  it("con la teglia in casa gli stili in teglia non chiedono la teglia", () => {
    const warnings = (has_baking_pan: boolean) =>
      (call("recommend_styles", { oven_type: "home", oven_max_temp_c: 250, limit: 30, has_baking_pan }).structuredContent as {
        styles: { id: string; warnings: string[] }[];
      }).styles.find((s) => s.id === "teglia_romana")?.warnings.join(" ") ?? "";
    expect(warnings(false)).toMatch(/teglia/i);
    expect(warnings(true)).not.toMatch(/Serve una teglia/);
  });

  it("con le ore disponibili tutto il procedimento sta prima del pasto", () => {
    const total = (args: Record<string, unknown>) => {
      const data = call("generate_recipe", { style_id: "ciaccino_senese", oven_type: "home", available_hours: 6, ...args })
        .structuredContent as { outcome: string; steps: { duration_minutes: number }[] };
      return data.steps.reduce((sum, step) => sum + step.duration_minutes, 0);
    };
    expect(total({})).toBeLessThanOrEqual(6 * 60);
    // Senza orario del pasto le ore limitano solo la fermentazione.
    expect(total({ meal_deadline: false })).toBeGreaterThan(6 * 60);
  });
});
