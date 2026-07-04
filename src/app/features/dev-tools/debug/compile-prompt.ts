import type { Annotation, ConsoleLog } from "./annotation-types";

function priorityLabel(p?: Annotation["priority"]): string {
  if (p === "high") return "ALTA";
  if (p === "low") return "BASSA";
  return "MEDIA";
}

/* ═══ COMPILE THE AI FIX PROMPT FROM THE LIVE ANNOTATIONS ═══ */
export function compilePrompt(annotations: Annotation[], sessionLogs: ConsoleLog[]): string {
  const draftState = (() => {
    try {
      return localStorage.getItem("vulcan_create_draft");
    } catch {
      return null;
    }
  })();

  let md = `### AI Code & UI Fix Request\n\n`;
  md += `I have visually annotated some issues in the interface. Below is the full technical context for each annotation, including target elements and parent code structures. Please modify the code files to resolve these issues.\n\n`;

  md += `#### 💻 Environment Metadata\n`;
  md += `- **Active Route**: \`${location.pathname}\`\n`;
  md += `- **Viewport Size**: \`${window.innerWidth}x${window.innerHeight}px\`\n`;
  md += `- **Theme State**: \`${document.documentElement.classList.contains("dark") ? "Dark Mode" : "Light Mode"}\`\n`;
  md += `- **User Agent**: \`${navigator.userAgent}\`\n\n`;

  if (draftState) {
    try {
      const parsed = JSON.parse(draftState);
      md += `#### 🍕 Active Pizza Engine Configuration State\n`;
      md += `\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\`\n\n`;
    } catch {
      md += `#### 🍕 Active Pizza Engine Configuration State\n`;
      md += `\`\`\`\n${draftState}\n\`\`\`\n\n`;
    }
  }

  md += `#### 📝 Annotations & Bug Details (${annotations.length})\n\n`;

  annotations.forEach((anno, i) => {
    md += `##### [Pin #${anno.index || i + 1}] — ${anno.comment}${anno.resolved ? " ✅ (segnata come risolta)" : ""}\n`;
    md += `- **Priorità**: \`${priorityLabel(anno.priority)}\`\n`;
    md += `- **Route**: \`${anno.route}\`\n`;
    md += `- **CSS Selector**: \`${anno.selector}\`\n`;
    md += `- **Target Element tag**: \`${anno.elementTag}\`\n`;

    if (anno.viewport) {
      md += `- **Viewport Size Context**: \`${anno.viewport.width}x${anno.viewport.height}px\`\n`;
    }
    if (anno.elementRect) {
      md += `- **Element Bounding Box**: \`top: ${Math.round(anno.elementRect.top)}px, left: ${Math.round(anno.elementRect.left)}px, width: ${Math.round(anno.elementRect.width)}px, height: ${Math.round(anno.elementRect.height)}px\`\n`;
    }
    if (anno.pageX !== undefined && anno.pageY !== undefined) {
      md += `- **Simple Pin Absolute Coordinates**: \`pageX: ${Math.round(anno.pageX)}px, pageY: ${Math.round(anno.pageY)}px\`\n`;
    }

    if (anno.computedStyles) {
      md += `- **Computed CSS Styles (Visual Context)**:\n`;
      md += `  - \`display\`: \`${anno.computedStyles.display}\`\n`;
      md += `  - \`position\`: \`${anno.computedStyles.position}\`\n`;
      md += `  - \`width / height\`: \`${anno.computedStyles.width} / ${anno.computedStyles.height}\`\n`;
      md += `  - \`padding\`: \`${anno.computedStyles.padding}\`\n`;
      md += `  - \`margin\`: \`${anno.computedStyles.margin}\`\n`;
      md += `  - \`fontSize / fontWeight\`: \`${anno.computedStyles.fontSize} / ${anno.computedStyles.fontWeight}\`\n`;
      md += `  - \`color / backgroundColor\`: \`${anno.computedStyles.color} / ${anno.computedStyles.backgroundColor}\`\n`;
      md += `  - \`zIndex / opacity\`: \`${anno.computedStyles.zIndex} / ${anno.computedStyles.opacity}\`\n`;
    }

    if (anno.recipeStateAtClick) {
      md += `- **Pizza Recipe Draft at click time**:\n`;
      md += `  \`\`\`json\n  ${JSON.stringify(anno.recipeStateAtClick, null, 2)}\n  \`\`\`\n`;
    }

    if (anno.consoleLogsAtClick && anno.consoleLogsAtClick.length > 0) {
      md += `- **Console logs snapshot at click time**:\n`;
      md += `  \`\`\`\n`;
      anno.consoleLogsAtClick.forEach((log) => {
        md += `  [${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}\n`;
      });
      md += `  \`\`\`\n`;
    }

    md += `- **Target Element HTML**:\n`;
    md += `  \`\`\`html\n  ${anno.outerHTML.slice(0, 1000)}${anno.outerHTML.length > 1000 ? "\n  ... [truncated]" : ""}\n  \`\`\`\n`;

    if (anno.parentHTML) {
      md += `- **HTML Parent Context**:\n`;
      md += `  \`\`\`html\n  ${anno.parentHTML}\n  \`\`\`\n`;
    }
    md += `\n---\n\n`;
  });

  if (sessionLogs.length > 0) {
    md += `#### ⚠️ Session Console Logs (Errors & Warnings)\n`;
    md += `\`\`\`\n`;
    sessionLogs.forEach((log) => {
      md += `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}\n`;
    });
    md += `\`\`\`\n\n`;
  }

  md += `#### 🛠️ Instructions for AI Fix:\n`;
  md += `1. **Design Tokens**: Adhere strictly to the design token tier system (T1-T4) configured in \`src/styles/theme.css\`. Avoid raw hex colors or layout sizes. Use semantic CSS variables.\n`;
  md += `2. **Responsive Styling**: Ensure the design remains fully responsive and mobile-optimized.\n`;
  md += `3. **Quality**: Fix the visual or logical bugs in the respective code files, matching the layout structure.\n`;

  return md;
}
