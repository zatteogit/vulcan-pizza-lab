#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream, existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(root, "output/playwright/visual-check");
const axePath = join(root, "node_modules/axe-core/axe.min.js");
const explicitVisualTarget = Boolean(
  process.env.VISUAL_CHECK_URL || process.env.VISUAL_CHECK_PORT,
);
let baseUrl = (
  process.env.VISUAL_CHECK_URL ||
  `http://127.0.0.1:${process.env.VISUAL_CHECK_PORT || "5178"}`
).replace(/\/$/, "");
const distIndex = join(root, "dist/index.html");
const session = `vulcan-visual-check-${process.pid}`;
const pwcli =
  process.env.PWCLI ||
  join(
    process.env.CODEX_HOME || join(process.env.HOME || "", ".codex"),
    "skills/playwright/scripts/playwright_cli.sh",
  );

const routes = [
  ["home", "/"],
  ["explore", "/explore"],
  ["learn", "/learn"],
  ["glossary", "/learn/glossary"],
  ["troubleshooting", "/learn/troubleshooting"],
  ["pre-ferments", "/learn/pre-ferments"],
  ["profile", "/profile"],
  ["recipe", "/recipe/napoletana_stg"],
  ["not-found", "/__visual-check-not-found"],
  ["design-system", "/design-system"],
];

const viewports = [
  [390, 844],
  [768, 1024],
  [1440, 1000],
];

/**
 * Copertura proporzionata, senza prodotto cartesiano ridondante:
 * - light: tutte le route a tutti i breakpoint (30 combinazioni);
 * - dark: tutte le route agli estremi mobile/desktop (20 combinazioni);
 * - reduced motion: le 5 superfici a maggiore densità/motion su mobile (5).
 */
const scenarios = [
  {
    name: "light",
    theme: "light",
    colorScheme: "light",
    reducedMotion: "no-preference",
    routeNames: routes.map(([name]) => name),
    viewportWidths: viewports.map(([width]) => width),
  },
  {
    name: "dark",
    theme: "dark",
    colorScheme: "dark",
    reducedMotion: "no-preference",
    routeNames: routes.map(([name]) => name),
    viewportWidths: [390, 1440],
  },
  {
    name: "reduced-motion",
    theme: "light",
    colorScheme: "light",
    reducedMotion: "reduce",
    routeNames: ["home", "explore", "recipe", "profile", "design-system"],
    viewportWidths: [390],
  },
];

/*
 * Eccezioni touch volutamente nominative. Il gate geometrico segnala solo
 * target inferiori a 24 px su entrambi gli assi; Axe applica poi il criterio
 * WCAG 2.2 completo, inclusa la spaziatura fra target. Non aggiungere wildcard.
 */
const touchBaseline = [];

let ownedServer = null;
let serverLog = null;
let interrupted = false;
let cliOpened = false;

function runCli(args, { allowFailure = false } = {}) {
  const result = spawnSync(pwcli, args, {
    cwd: outputDir,
    env: { ...process.env, PLAYWRIGHT_CLI_SESSION: session },
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  if (!allowFailure && (result.error || result.status !== 0)) {
    throw new Error(
      [result.error?.message, result.stdout, result.stderr].filter(Boolean).join("\n"),
    );
  }
  return result;
}

async function probeServer() {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1500) });
    const html = await response.text();
    const expectedHtml = existsSync(distIndex) ? await readFile(distIndex, "utf8") : "";
    const digest = (value) => createHash("sha256").update(value).digest("hex");
    return {
      reachable: response.ok,
      isVulcan:
        /<title>Vulcan Pizza Lab<\/title>/.test(html) && /id=["']root["']/.test(html),
      isCurrentBuild: Boolean(expectedHtml) && digest(html) === digest(expectedHtml),
    };
  } catch {
    return { reachable: false, isVulcan: false, isCurrentBuild: false };
  }
}

async function selectDefaultTarget() {
  if (explicitVisualTarget) return;
  for (let candidate = 5178; candidate <= 5198; candidate += 1) {
    baseUrl = `http://127.0.0.1:${candidate}`;
    const probe = await probeServer();
    if (!probe.reachable || (probe.isVulcan && probe.isCurrentBuild)) return;
  }
  throw new Error(
    "Nessuna porta QA libera fra 5178 e 5198; imposta VISUAL_CHECK_PORT.",
  );
}

async function ensureServer() {
  const initial = await probeServer();
  if (initial.reachable) {
    if (!initial.isVulcan) {
      throw new Error(
        `${baseUrl} risponde ma non sembra Vulcan; scegli VISUAL_CHECK_PORT o VISUAL_CHECK_URL.`,
      );
    }
    if (!initial.isCurrentBuild) {
      throw new Error(
        `${baseUrl} serve Vulcan ma non il build corrente in dist; libera la porta o scegli VISUAL_CHECK_PORT.`,
      );
    }
    return true;
  }

  const url = new URL(baseUrl);
  if (!["127.0.0.1", "localhost"].includes(url.hostname) || url.protocol !== "http:") {
    throw new Error(`Avvio automatico consentito solo su localhost HTTP, ricevuto ${baseUrl}.`);
  }
  const viteBin = join(root, "node_modules/.bin/vite");
  if (!existsSync(viteBin)) {
    throw new Error("Vite locale mancante: esegui npm install prima di visual:check.");
  }
  if (!existsSync(distIndex)) {
    throw new Error("Build di produzione mancante: esegui npm run build prima di visual:check.");
  }

  serverLog = createWriteStream(join(outputDir, "vite.log"), { flags: "w" });
  await new Promise((resolveOpen, rejectOpen) => {
    serverLog.once("open", resolveOpen);
    serverLog.once("error", rejectOpen);
  });
  ownedServer = spawn(
    viteBin,
    ["preview", "--host", url.hostname, "--port", url.port || "80", "--strictPort"],
    {
      cwd: root,
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", serverLog, serverLog],
    },
  );

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (ownedServer.exitCode !== null) {
      throw new Error(
        `Vite è terminato prematuramente; vedi ${join(outputDir, "vite.log")}.`,
      );
    }
    const probe = await probeServer();
    if (probe.reachable && probe.isVulcan && probe.isCurrentBuild) return false;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }
  throw new Error(
    `Timeout avviando Vite su ${baseUrl}; vedi ${join(outputDir, "vite.log")}.`,
  );
}

async function stopOwnedServer() {
  if (!ownedServer || ownedServer.exitCode !== null) {
    serverLog?.end();
    return;
  }
  ownedServer.kill("SIGTERM");
  await Promise.race([
    new Promise((resolveExit) => ownedServer.once("exit", resolveExit)),
    new Promise((resolveDelay) => setTimeout(resolveDelay, 3_000)),
  ]);
  if (ownedServer.exitCode === null) ownedServer.kill("SIGKILL");
  serverLog?.end();
}

function parseCliResult(stdout) {
  const startMarker = "### Result\n";
  const endMarker = "\n### Ran Playwright code";
  const start = stdout.indexOf(startMarker);
  const end = stdout.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) {
    throw new Error(`Output Playwright non riconosciuto:\n${stdout}`);
  }
  return JSON.parse(stdout.slice(start + startMarker.length, end));
}

function playwrightGuardSource() {
  return `async (page) => {
    const baseUrl = ${JSON.stringify(baseUrl)};
    const outputDir = ${JSON.stringify(outputDir)};
    const axePath = ${JSON.stringify(axePath)};
    const routes = ${JSON.stringify(routes)};
    const viewports = ${JSON.stringify(viewports)};
    const scenarios = ${JSON.stringify(scenarios)};
    const touchBaseline = ${JSON.stringify(touchBaseline)};
    const consoleErrors = [];
    const pageErrors = [];
    let current = { scenario: "bootstrap", name: "bootstrap", route: "bootstrap", width: 0 };

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push({ ...current, text: message.text() });
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push({ ...current, text: error.message });
    });

    await page.addInitScript(() => {
      localStorage.setItem("vulcan_profile_complete", "true");
      localStorage.setItem("vulcan_oven_pref", JSON.stringify({ ovenType: "home", maxTemp: 250 }));
      localStorage.setItem("vulcan_skill_level", JSON.stringify(2));
      localStorage.setItem("vulcan_ovens", JSON.stringify(["home"]));
      localStorage.setItem("vulcan_dev_mode", "false");
      localStorage.setItem("vulcan_debug_overlay_deactivated", "true");
      localStorage.removeItem("vulcan_theme");
    });

    const routeMap = new Map(routes);
    const viewportMap = new Map(viewports.map(([width, height]) => [width, height]));
    const results = [];

    for (const scenario of scenarios) {
      await page.emulateMedia({
        colorScheme: scenario.colorScheme,
        reducedMotion: scenario.reducedMotion,
      });
      await page.evaluate((theme) => {
        localStorage.setItem("vulcan_dark_mode", theme);
      }, scenario.theme);

      for (const width of scenario.viewportWidths) {
        const height = viewportMap.get(width);
        await page.setViewportSize({ width, height });

        for (const name of scenario.routeNames) {
          const route = routeMap.get(name);
          current = { scenario: scenario.name, name, route, width };
          const consoleStart = consoleErrors.length;
          const pageErrorStart = pageErrors.length;
          let appReady = true;

          await page.goto(baseUrl + route, { waitUntil: "domcontentloaded" });
          try {
            await page.waitForFunction(
              () => !document.querySelector("#vulcan-splash"),
              undefined,
              { timeout: 10_000 },
            );
          } catch {
            appReady = false;
          }
          await page.waitForTimeout(scenario.reducedMotion === "reduce" ? 1200 : 850);
          // Axe fotografa lo stato stabile: attende soltanto animazioni finite.
          // Gli eventuali loop restano esclusi e sono verificati separatamente.
          await page.evaluate(async () => {
            const finite = document.getAnimations({ subtree: true }).filter((animation) => {
              const timing = animation.effect?.getComputedTiming();
              return animation.playState === "running" && Number.isFinite(timing?.endTime);
            });
            await Promise.race([
              Promise.allSettled(finite.map((animation) => animation.finished)),
              new Promise((resolve) => setTimeout(resolve, 3_000)),
            ]);
          });
          await page.addScriptTag({ path: axePath });

          const axeViolations = await page.evaluate(async () => {
            const report = await window.axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
              },
              resultTypes: ["violations"],
            });
            return report.violations.map((violation) => ({
              id: violation.id,
              impact: violation.impact,
              help: violation.help,
              helpUrl: violation.helpUrl,
              nodes: violation.nodes.map((node) => ({
                target: node.target,
                summary: node.failureSummary,
                html: node.html.slice(0, 300),
              })),
            }));
          });

          const geometry = await page.evaluate(
            ({ route, width, scenario, touchBaseline }) => {
              const labelOf = (element) =>
                (
                  element.getAttribute("aria-label") ||
                  element.getAttribute("title") ||
                  element.innerText ||
                  element.textContent ||
                  element.tagName
                )
                  .replace(/\\s+/g, " ")
                  .trim()
                  .slice(0, 120);
              const visible = (element) => {
                const style = getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                return (
                  style.display !== "none" &&
                  style.visibility !== "hidden" &&
                  style.clip === "auto" &&
                  style.clipPath === "none" &&
                  Number(style.opacity) > 0 &&
                  rect.width > 0 &&
                  rect.height > 0
                );
              };
              const selector = [
                "button",
                "a[href]",
                "input:not([type='hidden'])",
                "select",
                "textarea",
                "summary",
                "[role='button']",
                "[role='tab']",
                "[role='radio']",
                "[role='checkbox']",
                "[role='switch']",
                "[role='option']",
              ].join(",");
              const interactive = [...document.querySelectorAll(selector)].filter(visible);
              const horizontalOutside = [];

              for (const element of interactive) {
                const rect = element.getBoundingClientRect();
                if (rect.left >= -1 && rect.right <= innerWidth + 1) continue;
                const aside = element.closest("aside");
                const asideRect = aside?.getBoundingClientRect();
                if (asideRect && (asideRect.right <= 1 || asideRect.left >= innerWidth - 1)) continue;
                let scrollParent = element.parentElement;
                let intentionalScroller = false;
                while (scrollParent) {
                  const style = getComputedStyle(scrollParent);
                  if (
                    /(auto|scroll)/.test(style.overflowX) &&
                    scrollParent.scrollWidth > scrollParent.clientWidth + 1
                  ) {
                    intentionalScroller = true;
                    break;
                  }
                  scrollParent = scrollParent.parentElement;
                }
                if (!intentionalScroller) {
                  horizontalOutside.push({
                    label: labelOf(element),
                    tag: element.tagName,
                    left: Math.round(rect.left),
                    right: Math.round(rect.right),
                  });
                }
              }

              const touchFailures = [];
              const touchAllowed = [];
              if (scenario.name === "light" && width === 390) {
                for (const element of interactive) {
                  const rect = element.getBoundingClientRect();
                  if (rect.width >= 24 || rect.height >= 24) continue;
                  const item = {
                    label: labelOf(element),
                    tag: element.tagName,
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                  };
                  const baseline = touchBaseline.find(
                    (entry) =>
                      entry.route === route &&
                      (entry.label === item.label ||
                        (entry.labelPattern && new RegExp(entry.labelPattern).test(item.label))),
                  );
                  const respectsFloor =
                    baseline &&
                    item.width >= (baseline.minWidth || 0) &&
                    item.height >= (baseline.minHeight || 0);
                  if (respectsFloor) touchAllowed.push({ ...item, reason: baseline.reason });
                  else touchFailures.push({ ...item, baseline: baseline?.reason || null });
                }
              }

              const infiniteAnimations =
                scenario.reducedMotion === "reduce"
                  ? document
                      .getAnimations({ subtree: true })
                      .filter((animation) => {
                        const timing = animation.effect?.getComputedTiming();
                        return animation.playState === "running" && timing?.iterations === Infinity;
                      })
                      .slice(0, 20)
                      .map((animation) => {
                        const target = animation.effect?.target;
                        return {
                          target:
                            target instanceof Element
                              ? target.id || target.className || target.tagName
                              : "unknown",
                          playState: animation.playState,
                        };
                      })
                  : [];

              return {
                bodyOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
                horizontalOutside,
                touchFailures,
                touchAllowed,
                textLeak: /\\b(?:cms|uiMessage)\\s*\\(/.test(document.body.innerText),
                viteOverlay: Boolean(document.querySelector("vite-error-overlay")),
                darkClass: document.documentElement.classList.contains("dark"),
                reducedMotionMedia: matchMedia("(prefers-reduced-motion: reduce)").matches,
                infiniteAnimations,
              };
            },
            { route, width, scenario, touchBaseline },
          );

          const evidencePaths = [];
          const pageEvidence =
            outputDir + "/evidence-" + scenario.name + "-" + name + "-" + width + ".png";
          // La misura reduced-motion è già stata raccolta sopra sul DOM reale.
          // Per gli artefatti, congelare temporaneamente motion/transizioni
          // evita frame intermedi e locator instabili senza mascherare il gate.
          const evidenceFreeze = await page.addStyleTag({
            content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;caret-color:transparent!important}",
          });
          await page.emulateMedia({
            colorScheme: scenario.colorScheme,
            reducedMotion: "reduce",
          });
          try {
            await page.screenshot({
              path: pageEvidence,
              fullPage: false,
              animations: "disabled",
            });
            evidencePaths.push(pageEvidence);

            // Due assi complementari per lo showcase: mobile light e desktop
            // dark. Ogni fondazione, componente, pattern T5 e template T6 ha
            // così un artefatto revisionabile, oltre ad Axe/geometry sull'intero DOM.
            if (
              name === "design-system" &&
              ((scenario.name === "light" && width === 390) ||
                (scenario.name === "dark" && width === 1440))
            ) {
              const sectionChromeFreeze = await page.addStyleTag({
                content:
                  ".ds-showcase>header,.dsx-s-bc043068fd,.dsx-s-b4645d1b2c{visibility:hidden!important}",
              });
              try {
                const sections = page.locator("[data-nav-id]");
                const count = await sections.count();
                for (let index = 0; index < count; index += 1) {
                  const section = sections.nth(index);
                  const id = await section.getAttribute("data-nav-id");
                  if (!id) continue;
                  const sectionEvidence =
                    outputDir + "/showcase-" + scenario.name + "-" + width + "-" + id + ".png";
                  await section.screenshot({
                    path: sectionEvidence,
                    animations: "disabled",
                    timeout: 60_000,
                  });
                  evidencePaths.push(sectionEvidence);
                }
              } finally {
                await sectionChromeFreeze.evaluate((element) => element.remove());
              }
            }
          } finally {
            await evidenceFreeze.evaluate((element) => element.remove());
            await page.emulateMedia({
              colorScheme: scenario.colorScheme,
              reducedMotion: scenario.reducedMotion,
            });
          }

          const routeConsoleErrors = consoleErrors.slice(consoleStart);
          const routePageErrors = pageErrors.slice(pageErrorStart);
          const keyboardFailures = [];

          // Smoke test del contratto overlay T4 reale. Lo showcase monta i
          // componenti di produzione, quindi un solo pass desktop verifica
          // autofocus, Escape e ripristino del trigger senza duplicare il
          // prodotto cartesiano per tutte le route.
          if (scenario.name === "light" && width === 1440 && name === "design-system") {
            const overlayCases = [
              { trigger: "Modal sheet", role: "dialog", name: "Anteprima modal sheet" },
              { trigger: "Conferma", role: "alertdialog", name: "Conferma salvataggio" },
              { trigger: "Bottom sheet", role: "dialog", name: "Dettagli impasto" },
            ];
            for (const overlayCase of overlayCases) {
              try {
                const trigger = page.getByRole("button", { name: overlayCase.trigger, exact: true });
                await trigger.scrollIntoViewIfNeeded();
                await trigger.click();
                const overlay = page.getByRole(overlayCase.role, {
                  name: overlayCase.name,
                  exact: true,
                });
                await overlay.waitFor({ state: "visible", timeout: 3_000 });
                await page.waitForTimeout(80);
                const focusedInside = await overlay.evaluate(
                  (element) => element.contains(document.activeElement),
                );
                if (!focusedInside) {
                  keyboardFailures.push({
                    overlay: overlayCase.name,
                    check: "initial-focus",
                  });
                }
                await page.keyboard.press("Shift+Tab");
                await page.keyboard.press("Tab");
                const trappedInside = await overlay.evaluate(
                  (element) => element.contains(document.activeElement),
                );
                if (!trappedInside) {
                  keyboardFailures.push({
                    overlay: overlayCase.name,
                    check: "tab-loop",
                  });
                }
                await page.keyboard.press("Escape");
                await overlay.waitFor({ state: "hidden", timeout: 3_000 });
                const focusRestored = await trigger.evaluate(
                  (element) => document.activeElement === element,
                );
                if (!focusRestored) {
                  keyboardFailures.push({
                    overlay: overlayCase.name,
                    check: "focus-restore",
                  });
                }
              } catch (error) {
                keyboardFailures.push({
                  overlay: overlayCase.name,
                  check: "interaction",
                  detail: error instanceof Error ? error.message : String(error),
                });
              }
            }

            try {
              const combobox = page.getByRole("combobox").first();
              await combobox.scrollIntoViewIfNeeded();
              await combobox.focus();
              await page.keyboard.press("ArrowDown");
              const listbox = page.getByRole("listbox").first();
              await listbox.waitFor({ state: "visible", timeout: 3_000 });
              await page.keyboard.press("ArrowDown");
              if (!(await combobox.getAttribute("aria-activedescendant"))) {
                keyboardFailures.push({ overlay: "Select", check: "active-descendant" });
              }
              await page.keyboard.press("Enter");
              await listbox.waitFor({ state: "hidden", timeout: 3_000 });
            } catch (error) {
              keyboardFailures.push({
                overlay: "Select",
                check: "combobox-keyboard",
                detail: error instanceof Error ? error.message : String(error),
              });
            }

            try {
              const radioGroup = page.locator('.ds-segmented[role="radiogroup"]').first();
              await radioGroup.scrollIntoViewIfNeeded();
              const current = radioGroup.locator('[role="radio"][tabindex="0"]').first();
              await current.focus();
              await page.keyboard.press("ArrowRight");
              const rovingCount = await radioGroup.locator('[role="radio"][tabindex="0"]').count();
              const focusInside = await radioGroup.evaluate(
                (element) => element.contains(document.activeElement),
              );
              if (rovingCount !== 1 || !focusInside) {
                keyboardFailures.push({
                  overlay: "SegmentedControl",
                  check: "roving-tabindex",
                  rovingCount,
                });
              }
            } catch (error) {
              keyboardFailures.push({
                overlay: "SegmentedControl",
                check: "arrow-keyboard",
                detail: error instanceof Error ? error.message : String(error),
              });
            }
          }

          if (scenario.name === "light" && width === 1440 && name === "home") {
            try {
              const searchModifier = await page.evaluate(() =>
                /Mac|iPhone|iPad/.test(navigator.platform) ? "Meta" : "Control",
              );
              await page.keyboard.down(searchModifier);
              await page.keyboard.press("k");
              await page.keyboard.up(searchModifier);
              const searchDialog = page.locator(".search-overlay-x__panel[role='dialog']");
              await searchDialog.waitFor({ state: "visible", timeout: 10_000 });
              const combobox = searchDialog.getByRole("combobox");
              const initialFocus = await searchDialog.evaluate(
                (element) => element.contains(document.activeElement),
              );
              const rootInert = await page.locator("#root").evaluate((element) => element.inert);
              if (!initialFocus || !rootInert) {
                keyboardFailures.push({
                  overlay: "SearchOverlay",
                  check: "focus-inert",
                  initialFocus,
                  rootInert,
                });
              }
              await combobox.fill("napoletana");
              const listbox = searchDialog.getByRole("listbox");
              await listbox.waitFor({ state: "visible", timeout: 3_000 });
              await page.keyboard.press("ArrowDown");
              if (!(await combobox.getAttribute("aria-activedescendant"))) {
                keyboardFailures.push({
                  overlay: "SearchOverlay",
                  check: "active-descendant",
                });
              }
              // React aggiorna risultati, gruppi ARIA e active descendant in commit
              // distinti; Axe deve osservare lo stato aperto stabile, non il frame
              // transitorio immediatamente successivo alla freccia.
              await page.waitForTimeout(120);
              await page.evaluate(async () => {
                const finite = document.getAnimations({ subtree: true }).filter((animation) => {
                  const timing = animation.effect?.getComputedTiming();
                  return animation.playState === "running" && Number.isFinite(timing?.endTime);
                });
                await Promise.race([
                  Promise.allSettled(finite.map((animation) => animation.finished)),
                  new Promise((resolve) => setTimeout(resolve, 1_500)),
                ]);
              });
              const dynamicAxe = await page.evaluate(async () => {
                const report = await window.axe.run(document, {
                  runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
                  },
                  resultTypes: ["violations"],
                });
                return report.violations.map((violation) => ({
                  id: violation.id,
                  nodes: violation.nodes.map((node) => ({
                    target: node.target,
                    summary: node.failureSummary,
                  })),
                }));
              });
              if (dynamicAxe.length) {
                keyboardFailures.push({
                  overlay: "SearchOverlay",
                  check: "axe-open-state",
                  violations: dynamicAxe,
                });
              }
              await page.keyboard.press("Escape");
              await searchDialog.waitFor({ state: "hidden", timeout: 3_000 });
              const rootStillInert = await page.locator("#root").evaluate((element) => element.inert);
              if (rootStillInert) {
                keyboardFailures.push({ overlay: "SearchOverlay", check: "inert-cleanup" });
              }
            } catch (error) {
              keyboardFailures.push({
                overlay: "SearchOverlay",
                check: "interaction",
                detail: error instanceof Error ? error.message : String(error),
              });
            }
          }
          const failures = [];
          if (!appReady) failures.push({ type: "app-ready-timeout" });
          if (routeConsoleErrors.length) {
            failures.push({ type: "console-error", details: routeConsoleErrors });
          }
          if (routePageErrors.length) {
            failures.push({ type: "pageerror", details: routePageErrors });
          }
          if (geometry.bodyOverflow > 1) {
            failures.push({ type: "body-overflow", pixels: geometry.bodyOverflow });
          }
          if (geometry.horizontalOutside.length) {
            failures.push({
              type: "interactive-outside-viewport",
              details: geometry.horizontalOutside,
            });
          }
          if (geometry.touchFailures.length) {
            failures.push({ type: "touch-target", details: geometry.touchFailures });
          }
          if (geometry.textLeak) failures.push({ type: "i18n-key-leak" });
          if (geometry.viteOverlay) failures.push({ type: "vite-error-overlay" });
          if (scenario.theme === "dark" && !geometry.darkClass) {
            failures.push({ type: "dark-theme-not-applied" });
          }
          if (scenario.theme === "light" && geometry.darkClass) {
            failures.push({ type: "light-theme-not-applied" });
          }
          if (scenario.reducedMotion === "reduce" && !geometry.reducedMotionMedia) {
            failures.push({ type: "reduced-motion-media-not-applied" });
          }
          if (geometry.infiniteAnimations.length) {
            failures.push({
              type: "reduced-motion-infinite-animation",
              details: geometry.infiniteAnimations,
            });
          }
          if (keyboardFailures.length) {
            failures.push({ type: "keyboard-focus-contract", details: keyboardFailures });
          }
          if (axeViolations.length) failures.push({ type: "axe", details: axeViolations });

          if (failures.length) {
            await page.screenshot({
              path: outputDir + "/failure-" + scenario.name + "-" + name + "-" + width + ".png",
              fullPage: false,
            });
          }
          results.push({
            scenario: scenario.name,
            name,
            route,
            width,
            height,
            failures,
            allowedTouchTargets: geometry.touchAllowed,
            evidencePaths,
          });
        }
      }
    }

    return {
      checkedAt: new Date().toISOString(),
      baseUrl,
      routeCount: routes.length,
      viewportCount: viewports.length,
      scenarioCount: scenarios.length,
      combinations: results.length,
      failures: results.flatMap((result) =>
        result.failures.map((failure) => ({
          scenario: result.scenario,
          name: result.name,
          route: result.route,
          width: result.width,
          ...failure,
        })),
      ),
      results,
    };
  }`;
}

function validateStaticConfiguration() {
  const names = new Set(routes.map(([name]) => name));
  const paths = new Set(routes.map(([, route]) => route));
  if (names.size !== routes.length || paths.size !== routes.length) {
    throw new Error("visual-check: nomi e path delle route devono essere univoci.");
  }
  const widths = new Set(viewports.map(([width]) => width));
  let combinations = 0;
  for (const scenario of scenarios) {
    for (const name of scenario.routeNames) {
      if (!names.has(name)) throw new Error(`visual-check: route scenario sconosciuta: ${name}`);
    }
    for (const width of scenario.viewportWidths) {
      if (!widths.has(width)) {
        throw new Error(`visual-check: viewport scenario sconosciuto: ${width}`);
      }
    }
    combinations += scenario.routeNames.length * scenario.viewportWidths.length;
  }
  if (combinations !== 55) {
    throw new Error(`visual-check: matrice attesa 55 combinazioni, trovate ${combinations}.`);
  }
  // Valida anche il codice inviato a `playwright-cli run-code`, che vive in
  // una stringa e non viene coperto dal normale `node --check` del file host.
  Function(`"use strict"; return (${playwrightGuardSource()});`)();
  return combinations;
}

async function main() {
  const combinations = validateStaticConfiguration();
  if (process.argv.includes("--self-test")) {
    console.log(
      `visual-check self-test: ${routes.length} route, ${viewports.length} breakpoint, ${combinations} combinazioni; sorgente Playwright valido.`,
    );
    return;
  }
  if (!existsSync(pwcli)) {
    throw new Error(`Wrapper Playwright CLI non trovato: ${pwcli}`);
  }
  if (!existsSync(axePath)) {
    throw new Error(
      `axe-core locale mancante: ${axePath}. Installa axe-core prima di visual:check.`,
    );
  }
  const npx = spawnSync("npx", ["--version"], { encoding: "utf8" });
  if (npx.error || npx.status !== 0) {
    throw new Error("npx non disponibile: installa Node.js/npm prima di visual:check.");
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await selectDefaultTarget();
  const reusedServer = await ensureServer();

  runCli(["open", baseUrl]);
  cliOpened = true;
  const cli = runCli(["run-code", playwrightGuardSource()]);
  const report = {
    ...parseCliResult(cli.stdout),
    server: { reused: reusedServer, owned: !reusedServer },
  };
  await writeFile(join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);

  const allowedCount = report.results.reduce(
    (sum, result) => sum + result.allowedTouchTargets.length,
    0,
  );
  const evidenceCount = report.results.reduce(
    (sum, result) => sum + result.evidencePaths.length,
    0,
  );
  console.log(
    `Visual check: ${report.combinations} combinazioni, ${report.failures.length} failure, ${allowedCount} target touch in baseline, ${evidenceCount} screenshot.`,
  );
  console.log(`Report: ${join(outputDir, "report.json")}`);
  if (report.failures.length) {
    for (const failure of report.failures) {
      console.error(
        `- ${failure.scenario} ${failure.route} @ ${failure.width}: ${failure.type}`,
      );
    }
    process.exitCode = 1;
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    interrupted = true;
    if (cliOpened) runCli(["close"], { allowFailure: true });
    await stopOwnedServer();
    process.exit(128 + (signal === "SIGINT" ? 2 : 15));
  });
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (!interrupted) {
    if (cliOpened) runCli(["close"], { allowFailure: true });
    await stopOwnedServer();
  }
}
