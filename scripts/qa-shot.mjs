#!/usr/bin/env node
/**
 * qa-shot — screenshot deterministico via Chrome headless + CDP.
 *
 * Serve alla QA visiva del piano di tokenizzazione (docs/piano-tokenizzazione-
 * semantica.md §8): baseline/after con la stessa matrice. Rispetto al puro
 * `--screenshot` di Chrome aggiunge ciò che lì manca: seeding di localStorage
 * PRIMA del primo script della pagina (FTU del profilo), viewport emulato,
 * prefers-color-scheme forzato light e un settle per le animazioni d'ingresso.
 *
 * Uso:
 *   node scripts/qa-shot.mjs --url http://localhost:5174/profile \
 *     --out .qa/wave-1/baseline/profile-430-vulcan.png \
 *     --width 430 [--height 1100] [--seed .qa/seed-profile.json] \
 *     [--settle 1500] [--timeout 20000] [--full 1] [--maxpages 8]
 *
 * --full: cattura l'INTERA pagina a segmenti alti quanto il viewport
 * (out-p1.png, out-p2.png, …), scrollando prima di ogni cattura così le
 * animazioni whileInView si attivano. Senza --full: solo il viewport.
 *
 * --seed: file JSON { chiave: valoreStringa } scritto in localStorage via
 * Page.addScriptToEvaluateOnNewDocument (gira prima dello script inline di
 * index.html, quindi anche il tema seedato vince sul default).
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
}
const url = args.url;
const out = args.out;
const width = Number(args.width ?? 430);
const height = Number(args.height ?? 1100);
const settle = Number(args.settle ?? 1500);
const timeout = Number(args.timeout ?? 20000);
if (!url || !out) {
  console.error("uso: qa-shot.mjs --url <url> --out <png> [--width N] [--height N] [--seed file.json] [--settle ms] [--timeout ms]");
  process.exit(1);
}

const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profileDir = mkdtempSync(join(tmpdir(), "qa-shot-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-debugging-port=0",
  `--user-data-dir=${profileDir}`,
  "about:blank",
]);

function cleanup(code) {
  try { chrome.kill(); } catch {}
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
  process.exit(code);
}
process.on("SIGINT", () => cleanup(130));

const wsUrl = await new Promise((resolve, reject) => {
  let buf = "";
  const t = setTimeout(() => reject(new Error("Chrome non ha esposto il DevTools endpoint")), 15000);
  chrome.stderr.on("data", (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) { clearTimeout(t); resolve(m[1]); }
  });
  chrome.on("exit", () => reject(new Error("Chrome uscito prima dell'endpoint")));
}).catch((e) => { console.error(e.message); cleanup(1); });

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let msgId = 0;
const pending = new Map();
const eventWaiters = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(`${msg.error.message}`)) : resolve(msg.result);
  } else if (msg.method) {
    for (let i = eventWaiters.length - 1; i >= 0; i--) {
      if (eventWaiters[i].method === msg.method) {
        eventWaiters[i].resolve(msg.params);
        eventWaiters.splice(i, 1);
      }
    }
  }
};
function send(method, params = {}, sessionId) {
  const id = ++msgId;
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
const waitEvent = (method, ms) =>
  new Promise((resolve) => {
    eventWaiters.push({ method, resolve });
    setTimeout(() => resolve(null), ms);
  });

try {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

  await send("Page.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 2, mobile: width < 800,
  }, sessionId);
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "light" }],
  }, sessionId);

  if (args.seed) {
    const seed = JSON.parse(readFileSync(args.seed, "utf8"));
    const src = Object.entries(seed)
      .map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(String(v))});`)
      .join("\n");
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `try {\n${src}\n} catch (e) {}`,
    }, sessionId);
  }

  const loaded = waitEvent("Page.loadEventFired", timeout);
  await send("Page.navigate", { url }, sessionId);
  if ((await loaded) === null) {
    console.error(`(load non arrivato entro ${timeout}ms — catturo comunque)`);
  }
  await new Promise((r) => setTimeout(r, settle));
  mkdirSync(dirname(out), { recursive: true });

  if (args.full) {
    const { result } = await send("Runtime.evaluate", {
      expression: "document.documentElement.scrollHeight",
      returnByValue: true,
    }, sessionId);
    const pages = Math.min(Math.max(1, Math.ceil(result.value / height)), Number(args.maxpages ?? 8));
    for (let p = 0; p < pages; p++) {
      await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${p * height})` }, sessionId);
      await new Promise((r) => setTimeout(r, 600));
      const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
      const file = out.replace(/\.png$/, `-p${p + 1}.png`);
      writeFileSync(file, Buffer.from(data, "base64"));
      console.log(`✓ ${file} (${width}×${height} @2x, ${p + 1}/${pages})`);
    }
  } else {
    const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
    writeFileSync(out, Buffer.from(data, "base64"));
    console.log(`✓ ${out} (${width}×${height} @2x)`);
  }
  cleanup(0);
} catch (e) {
  console.error(`qa-shot: ${e.message}`);
  cleanup(1);
}
