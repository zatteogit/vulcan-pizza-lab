/* ═══ D-049 — Protocollo MCP (JSON-RPC 2.0, trasporto HTTP «streamable») ═══
 *
 * Il Worker riceve su /mcp un POST con un messaggio JSON-RPC (o un elenco) e
 * risponde con JSON. Server senza stato e in sola lettura: niente sessioni né
 * notifiche dal server. Metodi: initialize, ping, tools/list, tools/call;
 * le notifiche del client (senza id) non hanno risposta.
 * Specifica: https://modelcontextprotocol.io/specification/2025-06-18
 */

import { MCP_SERVER_INFO, MCP_TOOLS, ToolInputError } from "./mcp-tools";

export const MCP_PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_VERSIONS = new Set(["2025-06-18", "2025-03-26", "2024-11-05"]);

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: string | number | null; result: unknown }
  | { jsonrpc: "2.0"; id: string | number | null; error: { code: number; message: string } };

const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;

function error(id: JsonRpcRequest["id"], code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

function isRequest(value: unknown): value is JsonRpcRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as JsonRpcRequest).jsonrpc === "2.0" &&
    typeof (value as JsonRpcRequest).method === "string"
  );
}

function callTool(params: Record<string, unknown> | undefined) {
  const name = String(params?.name ?? "");
  const tool = MCP_TOOLS.find((t) => t.name === name);
  if (!tool) return null;
  const args = (params?.arguments ?? {}) as Record<string, unknown>;
  try {
    const { summary, data } = tool.run(args);
    return { content: [{ type: "text", text: summary }], structuredContent: data, isError: false };
  } catch (e) {
    // Errori d'input e del motore tornano al modello come risultato: può
    // correggersi e riprovare (convenzione MCP), invece di un errore di rete.
    const message = e instanceof ToolInputError ? e.message : `engine error: ${(e as Error).message}`;
    return { content: [{ type: "text", text: message }], isError: true };
  }
}

/** Una risposta per una richiesta; null per le notifiche. */
export function handleMcpMessage(message: unknown): JsonRpcResponse | null {
  if (!isRequest(message)) return error(null, INVALID_REQUEST, "invalid JSON-RPC request");
  const { id, method, params } = message;
  const isNotification = id === undefined;
  if (isNotification) return null;

  switch (method) {
    case "initialize": {
      const requested = String(params?.protocolVersion ?? "");
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: SUPPORTED_VERSIONS.has(requested) ? requested : MCP_PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: MCP_SERVER_INFO,
          instructions:
            "Pizza engine: list_styles and get_style describe styles; recommend_styles ranks them for a kitchen; generate_recipe returns grams, baker's percentages, timed steps and whether the recipe is feasible; glossary explains terms. Numbers are the same the app shows.",
        },
      };
    }
    case "ping":
      return { jsonrpc: "2.0", id, result: {} };
    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: MCP_TOOLS.map(({ name, title, description, inputSchema }) => ({
            name,
            title,
            description,
            inputSchema,
            annotations: { readOnlyHint: true, openWorldHint: false },
          })),
        },
      };
    case "tools/call": {
      const result = callTool(params);
      if (!result) return error(id, INVALID_PARAMS, `unknown tool "${String(params?.name ?? "")}"`);
      return { jsonrpc: "2.0", id, result };
    }
    default:
      return error(id, METHOD_NOT_FOUND, `method "${method}" not found`);
  }
}

/** Corpo HTTP → risposta JSON (o null se c'erano solo notifiche). */
export function handleMcpBody(body: string): { status: number; json: unknown | null } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { status: 400, json: error(null, PARSE_ERROR, "invalid JSON") };
  }
  if (Array.isArray(parsed)) {
    const responses = parsed.map(handleMcpMessage).filter((r): r is JsonRpcResponse => r !== null);
    return responses.length ? { status: 200, json: responses } : { status: 202, json: null };
  }
  const response = handleMcpMessage(parsed);
  return response ? { status: 200, json: response } : { status: 202, json: null };
}
