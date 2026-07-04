import {
Activity,
AlertTriangle,
ArrowLeft,
BarChart3,
Beaker,
Bug,
CheckCircle2,
ChevronDown,
Circle,
CircleX,
ClipboardCheck,
ExternalLink,
FileCode2,
Flame,
FlaskConical,
FolderGit2,
GitBranch,
GitCommitHorizontal,
Info,
Leaf,
LoaderCircle,
Moon,
Package,
PenTool,
Play,
Shield,
Sparkles,
Sun,
TestTubes,
Thermometer,
Timer,
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import React,{ useCallback,useMemo,useState } from "react";
import { DesignSystemTab } from "../../components/design-system/index";
import { Badge, FilterChip, SegmentedControl, Surface } from "../../components/ds/index";
import { EngineTestSuite } from "./engine-test-suite";
import { FeedbackAnalysisPanel } from "../recipe/feedback-analysis";
import {
STYLES_DB,
calculateOvenCompensations,
estimatePL,
generateRecipe,
getQ10,
recommendStyles,
type OvenType,
type UserConstraints,
} from "../../domain/pizza-engine";
import { StyleEditorTab } from "./style-editor-tab";

/* ═══ TYPES ═══ */
type TabId = "project" | "editor" | "engine" | "design";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: "project", label: "Progetto", icon: <FolderGit2 size={14} /> },
  { id: "design", label: "Design System", icon: <Sparkles size={14} /> },
  { id: "editor", label: "Style Editor", icon: <PenTool size={14} /> },
  { id: "engine", label: "Engine Lab", icon: <TestTubes size={14} /> },
];

/* ═══ LEGACY TAB REDIRECT MAP ═══ */
const LEGACY_TAB_MAP: Record<string, TabId> = {
  overview: "project",
  audit: "project",
  styles: "editor",
  compensations: "engine",
  q10: "engine",
  scores: "engine",
};

/* ═══ HELPERS ═══ */
function formatSec(sec: number): string {
  if (sec < 120) return `${sec}s`;
  return `${Math.round(sec / 60)}min`;
}

/* ═══ REUSABLE: DataCell ═══ */
function DataCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="p-2.5 rounded-lg"
      style={{
        background: highlight
          ? "color-mix(in srgb, var(--axis-authenticity) 10%, transparent)"
          : "var(--container-bg)",
      }}
    >
      <div className="type-label" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginBottom: "4px" }}>
        {label}
      </div>
      <div
        className="type-data"
        style={{
          color: highlight ? "var(--axis-authenticity)" : "var(--text-default)",
          fontWeight: "var(--weight-semibold)" as any,
          fontFeatureSettings: "'tnum'",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ═══ REUSABLE: Section with accordion ═══ */
function LabSection({
  title,
  icon,
  color,
  defaultOpen,
  badge,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <Surface className="overflow-hidden" style={{ borderLeft: `3px solid ${color}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 active:scale-[0.99] transition-transform"
        style={{ background: "transparent" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
          >
            {icon}
          </div>
          <span className="type-data" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
            {title}
          </span>
          {badge}
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <ChevronDown size={14} style={{ color: "var(--icon-muted)" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--container-border)" }}>
              <div className="pt-4">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Surface>
  );
}

/* ═══ GLOB: source files per bundle stats ═══ */
const sourceGlobs = import.meta.glob(
  [
    "/src/app/**/*.{ts,tsx}",
    "/src/styles/**/*.css",
    "/src/main.tsx",
  ],
  { query: "?raw", import: "default" }
) as Record<string, () => Promise<string>>;

const configGlobs = import.meta.glob(
  ["/vite.config.ts", "/tsconfig.json", "/index.html", "/postcss.config.mjs"],
  { query: "?raw", import: "default" }
) as Record<string, () => Promise<string>>;

const EXCLUDE_PATTERNS = ["/src/app/components/ui/"];
function isExcluded(path: string): boolean {
  return EXCLUDE_PATTERNS.some((p) => path.startsWith(p));
}

/* ═══ ENGINE HEALTH CHECK TYPES ═══ */
interface HealthResult {
  name: string;
  status: "pass" | "fail" | "warn";
  ms: number;
  detail: string;
}

interface BundleStats {
  totalFiles: number;
  totalLines: number;
  totalChars: number;
  byExt: Record<string, { files: number; lines: number }>;
  biggest: { path: string; lines: number }[];
}

/* ═══ PROJECT TAB ═══ */
function ProjectTab() {
  const REPO_URL = "https://github.com/zatteogit/vulcan-pizza-lab";

  /* ── Health check state ── */
  const [healthResults, setHealthResults] = useState<HealthResult[] | null>(null);
  const [healthRunning, setHealthRunning] = useState(false);
  const [healthTotalMs, setHealthTotalMs] = useState(0);

  const runHealthCheck = useCallback(async () => {
    setHealthRunning(true);
    setHealthResults(null);
    const results: HealthResult[] = [];
    const t0 = performance.now();

    const testConstraints: UserConstraints = {
      oven_type: "home", oven_max_temp_c: 250, skill_level: 2 as 1|2|3|4,
      available_hours: 24, dough_balls: 4,
      has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false,
      dietary_filters: [], pantry_flours: [], pantry_yeasts: [],
    };

    // 1. STYLES_DB integrity
    {
      const t = performance.now();
      try {
        const count = Object.keys(STYLES_DB).length;
        const fams = [...new Set(Object.values(STYLES_DB).map(s => s.family))].length;
        const allHaveRange = Object.values(STYLES_DB).every(s =>
          s.dough.hydration_pct_range[0] < s.dough.hydration_pct_range[1] &&
          s.dough.flour_w_range[0] < s.dough.flour_w_range[1]
        );
        results.push({
          name: "STYLES_DB",
          status: allHaveRange ? "pass" : "warn",
          ms: Math.round((performance.now() - t) * 100) / 100,
          detail: `${count} stili, ${fams} famiglie${!allHaveRange ? " — range invertiti rilevati" : ""}`,
        });
      } catch (e: any) {
        results.push({ name: "STYLES_DB", status: "fail", ms: Math.round((performance.now() - t) * 100) / 100, detail: e.message });
      }
    }

    // 2. getQ10
    {
      const t = performance.now();
      try {
        const r1 = getQ10("fresh", 4);
        const r2 = getQ10("sourdough", 22);
        const ok = r1.q10 > 0 && r2.q10 > 0 && r1.model && r2.model;
        results.push({ name: "getQ10()", status: ok ? "pass" : "warn", ms: Math.round((performance.now() - t) * 100) / 100, detail: `fresh@4°C→Q10=${r1.q10}, madre@22°C→Q10=${r2.q10}` });
      } catch (e: any) {
        results.push({ name: "getQ10()", status: "fail", ms: Math.round((performance.now() - t) * 100) / 100, detail: e.message });
      }
    }

    // 3. estimatePL
    {
      const t = performance.now();
      try {
        const pl = estimatePL(280, [0.5, 0.7]);
        const ok = pl >= 0.3 && pl <= 1.0;
        results.push({ name: "estimatePL()", status: ok ? "pass" : "warn", ms: Math.round((performance.now() - t) * 100) / 100, detail: `W=280→P/L=${pl}` });
      } catch (e: any) {
        results.push({ name: "estimatePL()", status: "fail", ms: Math.round((performance.now() - t) * 100) / 100, detail: e.message });
      }
    }

    // 4. calculateOvenCompensations per ogni stile
    {
      const t = performance.now();
      let errors = 0;
      for (const style of Object.values(STYLES_DB)) {
        try {
          const c = calculateOvenCompensations(style, 220);
          if (isNaN(c.cook_time_sec) || c.cook_time_sec <= 0) errors++;
        } catch { errors++; }
      }
      results.push({
        name: "calculateOvenCompensations()",
        status: errors === 0 ? "pass" : "fail",
        ms: Math.round((performance.now() - t) * 100) / 100,
        detail: errors === 0 ? `${Object.keys(STYLES_DB).length} stili @220°C — tutti OK` : `${errors} errori su ${Object.keys(STYLES_DB).length} stili`,
      });
    }

    // 5. generateRecipe per ogni stile
    {
      const t = performance.now();
      let errors = 0;
      const scoreRanges: Record<string, { min: number; max: number }> = {};
      for (const style of Object.values(STYLES_DB)) {
        try {
          const r = generateRecipe(style, testConstraints);
          if (isNaN(r.scores.composite) || r.scores.composite < 0) errors++;
          // Track score ranges
          for (const key of ["authenticity", "feasibility", "digestibility", "sustainability", "experimentation"] as const) {
            if (!scoreRanges[key]) scoreRanges[key] = { min: 100, max: 0 };
            scoreRanges[key].min = Math.min(scoreRanges[key].min, r.scores[key]);
            scoreRanges[key].max = Math.max(scoreRanges[key].max, r.scores[key]);
          }
        } catch { errors++; }
      }
      results.push({
        name: "generateRecipe()",
        status: errors === 0 ? "pass" : "fail",
        ms: Math.round((performance.now() - t) * 100) / 100,
        detail: errors === 0
          ? `${Object.keys(STYLES_DB).length} ricette generate — score A:${scoreRanges.authenticity?.min}-${scoreRanges.authenticity?.max}, F:${scoreRanges.feasibility?.min}-${scoreRanges.feasibility?.max}`
          : `${errors} errori`,
      });
    }

    // 6. recommendStyles
    {
      const t = performance.now();
      try {
        const recs = recommendStyles(testConstraints);
        const tiers = { perfect: 0, good: 0, challenging: 0 };
        recs.forEach((r: any) => { if (tiers.hasOwnProperty(r.tier)) tiers[r.tier as keyof typeof tiers]++; });
        results.push({
          name: "recommendStyles()",
          status: recs.length > 0 ? "pass" : "warn",
          ms: Math.round((performance.now() - t) * 100) / 100,
          detail: `${recs.length} raccomandazioni: ${tiers.perfect} perfect, ${tiers.good} good, ${tiers.challenging} challenging`,
        });
      } catch (e: any) {
        results.push({ name: "recommendStyles()", status: "fail", ms: Math.round((performance.now() - t) * 100) / 100, detail: e.message });
      }
    }

    setHealthTotalMs(Math.round(performance.now() - t0));
    setHealthResults(results);
    setHealthRunning(false);
  }, []);

  /* ── Bundle stats state ── */
  const [bundleStats, setBundleStats] = useState<BundleStats | null>(null);
  const [bundleLoading, setBundleLoading] = useState(false);

  const scanBundle = useCallback(async () => {
    setBundleLoading(true);
    const byExt: Record<string, { files: number; lines: number }> = {};
    let totalLines = 0;
    let totalChars = 0;
    let totalFiles = 0;
    const fileList: { path: string; lines: number }[] = [];

    const allPaths = [
      ...Object.keys(sourceGlobs).filter(p => !isExcluded(p)),
      ...Object.keys(configGlobs),
    ];

    for (const path of allPaths) {
      try {
        const loader = sourceGlobs[path] || configGlobs[path];
        if (!loader) continue;
        const content = await loader();
        const lines = content.split("\n").length;
        const ext = path.split(".").pop() || "?";
        if (!byExt[ext]) byExt[ext] = { files: 0, lines: 0 };
        byExt[ext].files++;
        byExt[ext].lines += lines;
        totalLines += lines;
        totalChars += content.length;
        totalFiles++;
        fileList.push({ path, lines });
      } catch { /* skip */ }
    }

    fileList.sort((a, b) => b.lines - a.lines);

    setBundleStats({
      totalFiles,
      totalLines,
      totalChars,
      byExt,
      biggest: fileList.slice(0, 8),
    });
    setBundleLoading(false);
  }, []);

  /* ── Issues ── */
  const issues: { id: string; severity: string; desc: string; status: "closed" | "blocked" | "open" }[] = [
    { id: "C01", severity: "media", desc: "engine: Chicago Deep Dish butter fix (VPL-C01)", status: "closed" },
    { id: "C02", severity: "media", desc: "engine: Q10 variabile per tipo lievito (VPL-C02)", status: "closed" },
    { id: "C03", severity: "media", desc: "engine: P/L alveografico + estimatePL(W) (VPL-C03)", status: "closed" },
    { id: "C04", severity: "media", desc: "engine: Compensazioni Arrhenius 5 assi (VPL-C04)", status: "closed" },
    { id: "C05", severity: "media", desc: "engine: STG W AVPN 2024 [250,320] (VPL-C05)", status: "closed" },
    { id: "C06", severity: "bassa", desc: "engine: Feasibility W×H interaction (VPL-C06)", status: "closed" },
    { id: "001", severity: "media", desc: "a11y: DoughBlob prefers-reduced-motion (VPL-001)", status: "closed" },
    { id: "002", severity: "bassa", desc: "ux: Dark mode localStorage persist (VPL-002)", status: "closed" },
    { id: "003", severity: "media", desc: "feat: Geolocation + Open-Meteo (VPL-003)", status: "closed" },
    { id: "004", severity: "info", desc: "cleanup: artefatto di import rimosso (VPL-004)", status: "closed" },
    { id: "005", severity: "media", desc: "refactor: scroll-companion 3 sezioni (VPL-005)", status: "closed" },
    { id: "006", severity: "bassa", desc: "refactor: ScoreRing DRY (VPL-006)", status: "closed" },
    { id: "007", severity: "bassa", desc: "perf: Lazy loading immagini (VPL-007)", status: "closed" },
    { id: "008", severity: "bassa", desc: "a11y: Focus management build→result (VPL-008)", status: "closed" },
    { id: "009", severity: "bassa", desc: "a11y: Skip-to-content (VPL-009)", status: "closed" },
    { id: "010", severity: "info", desc: "feat: SVG sfondi — annullata (VPL-010)", status: "closed" },
    { id: "011", severity: "media", desc: "feat: ScrollSection soft-focus (VPL-011)", status: "closed" },
    { id: "012", severity: "media", desc: "feat: Slider P/L nerdMode (VPL-012)", status: "closed" },
    { id: "013", severity: "bassa", desc: "feat: Compensazioni UI (VPL-013)", status: "closed" },
    { id: "014", severity: "alta", desc: "devops: pnpm build TypeScript (VPL-014)", status: "closed" },
    { id: "015", severity: "bassa", desc: "devops: Sub-route /dev/:tab (VPL-015)", status: "closed" },
    { id: "016", severity: "media", desc: "docs: Guidelines.md routing (VPL-016)", status: "closed" },
    { id: "017", severity: "media", desc: "docs: Notion sync (VPL-017)", status: "closed" },
    { id: "019", severity: "media", desc: "a11y: Dark toggle aria-label (VPL-019)", status: "closed" },
    { id: "020", severity: "media", desc: "a11y: recipe-output aria-label (VPL-020)", status: "closed" },
    { id: "021", severity: "bassa", desc: "a11y: ScoreDashboard close (VPL-021)", status: "closed" },
    { id: "022", severity: "bassa", desc: "a11y: Kitchen temp buttons (VPL-022)", status: "closed" },
    { id: "023", severity: "bassa", desc: "a11y: Hero glow reduced-motion (VPL-023)", status: "closed" },
    { id: "024", severity: "bassa", desc: "anim: ScrollSection spring (VPL-024)", status: "closed" },
    { id: "025", severity: "bassa", desc: "anim: recommended-styles spring (VPL-025)", status: "closed" },
    { id: "026", severity: "bassa", desc: "anim: recipe-output spring (VPL-026)", status: "closed" },
    { id: "027", severity: "bassa", desc: "ux: Indietro tap feedback (VPL-027)", status: "closed" },
    { id: "028", severity: "bassa", desc: "ux: Dark toggle tap (VPL-028)", status: "closed" },
    { id: "029", severity: "bassa", desc: "ux: Fine-tuning tap (VPL-029)", status: "closed" },
    { id: "030", severity: "bassa", desc: "ux: ScoreDashboard tap (VPL-030)", status: "closed" },
    { id: "031", severity: "bassa", desc: "token: fontSize scala (VPL-031)", status: "closed" },
    { id: "032", severity: "media", desc: "bundle: ~47 file ui/ dead code (VPL-032)", status: "blocked" },
    { id: "033", severity: "media", desc: "bundle: ~12 npm orfani (VPL-033)", status: "blocked" },
    { id: "034", severity: "info", desc: "DS: P01–P08 patterns (VPL-034)", status: "closed" },
    { id: "040", severity: "media", desc: "ux: Auto button tap (VPL-040)", status: "closed" },
    { id: "041", severity: "media", desc: "ux: Annulla button tap (VPL-041)", status: "closed" },
    { id: "042", severity: "media", desc: "css: transparent→rgba UnifiedChip (VPL-042)", status: "closed" },
    { id: "043", severity: "media", desc: "css: transparent→rgba cards (VPL-043)", status: "closed" },
    { id: "044", severity: "media", desc: "css: transparent→rgba info-tip (VPL-044)", status: "closed" },
    { id: "045", severity: "bassa", desc: "a11y: scroll-companion reduced-motion (VPL-045)", status: "closed" },
    { id: "046", severity: "media", desc: "token: var(--foreground)→text-default (VPL-046)", status: "closed" },
    { id: "047", severity: "media", desc: "token: var(--background)→container-page (VPL-047)", status: "closed" },
    { id: "048", severity: "bassa", desc: "css: transparent→rgba DS (VPL-048)", status: "closed" },
    { id: "049", severity: "bassa", desc: "css: transparent→rgba dev-tools (VPL-049)", status: "closed" },
    { id: "050", severity: "bassa", desc: "anim: progress bar spring (VPL-050)", status: "closed" },
    { id: "051", severity: "bassa", desc: "css: transparent residuo (VPL-051)", status: "closed" },
    { id: "052", severity: "bassa", desc: "css: duplicato transition (VPL-052)", status: "closed" },
    { id: "053", severity: "media", desc: "engine: Espansione 9→15 stili (VPL-053)", status: "closed" },
    { id: "054", severity: "media", desc: "ux: Filtro famiglia pizza (VPL-054)", status: "closed" },
    /* ═══ EPIC: NAV — Tab Bar & App Shell ═══ */
    { id: "055", severity: "alta", desc: "nav: AppShell + Tab Bar Material 3 (VPL-055)", status: "closed" },
    { id: "056", severity: "alta", desc: "nav: Route restructuring (VPL-056)", status: "closed" },
    { id: "057", severity: "alta", desc: "nav: ProfilePage + FTU onboarding (VPL-057)", status: "closed" },
    { id: "058", severity: "alta", desc: "nav: RecipePage self-contained (VPL-058)", status: "closed" },
    { id: "059", severity: "alta", desc: "nav: ExplorePage catalogo stili (VPL-059)", status: "closed" },
    { id: "060", severity: "alta", desc: "nav: CreatePage wizard snello (VPL-060)", status: "closed" },
    { id: "061", severity: "media", desc: "nav: SearchPage ricerca globale (VPL-061)", status: "closed" },
    { id: "062", severity: "media", desc: "nav: LearnPage hub educativo (VPL-062)", status: "closed" },
    { id: "063", severity: "media", desc: "refactor: home.tsx decomposition (VPL-063)", status: "closed" },
    { id: "064", severity: "media", desc: "feat: Deep linking + URL state (VPL-064)", status: "closed" },
    /* ═══ Epic WIZARD-V2 ═══ */
    { id: "065", severity: "alta", desc: "engine: dynamic time slots + nessuna preferenza (VPL-065)", status: "closed" },
    { id: "066", severity: "alta", desc: "engine: kitchen temp model fix 21°C indoor (VPL-066)", status: "closed" },
    { id: "067", severity: "alta", desc: "feat: useProfileDefaults() bridge profilo→wizard (VPL-067)", status: "closed" },
    { id: "068", severity: "alta", desc: "ux: Wizard V2 — 2 step, settings collassabili, no scroll-snap (VPL-068)", status: "closed" },
    { id: "069", severity: "media", desc: "feat: /learn/pre-ferments sub-route (VPL-069)", status: "closed" },
    { id: "070", severity: "bassa", desc: "docs: font refactor DM Mono → nerd-only, DS descriptions updated (VPL-070)", status: "closed" },
    { id: "071", severity: "bassa", desc: "docs: issue tracker + Guidelines sync (VPL-071)", status: "closed" },
    { id: "072", severity: "media", desc: "ux: ricerca contestuale M3 — command palette ⌘K, tab Cerca rimosso, SearchOverlay globale (VPL-072)", status: "closed" },
  ];

  const closedCount = issues.filter((i) => i.status === "closed").length;
  const blockedCount = issues.filter((i) => i.status === "blocked").length;
  const openCount = issues.filter((i) => i.status === "open").length;
  const [showIssues, setShowIssues] = useState(false);

  const healthPassCount = healthResults ? healthResults.filter(r => r.status === "pass").length : 0;
  const healthFailCount = healthResults ? healthResults.filter(r => r.status === "fail").length : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ ENGINE HEALTH CHECK ═══ */}
      <LabSection
        title="Diagnostica Engine"
        icon={<Activity size={13} />}
        color={healthResults ? (healthFailCount > 0 ? "var(--text-error)" : "var(--cta)") : "var(--cta)"}
        defaultOpen
        badge={healthResults ? (
          <Badge
            tone={healthFailCount > 0 ? "error" : "cta"}
            background={healthFailCount > 0 ? "color-mix(in srgb, var(--text-error) 15%, transparent)" : "color-mix(in srgb, var(--cta) 15%, transparent)"}
          >
            {healthPassCount}/{healthResults.length} OK · {healthTotalMs}ms
          </Badge>
        ) : undefined}
      >
        {/* Run button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={runHealthCheck}
            disabled={healthRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl type-data active:scale-95 transition-transform"
            style={{
              background: healthRunning ? "var(--container-bg)" : "var(--cta)",
              color: healthRunning ? "var(--text-muted)" : "white",
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--weight-semibold)" as any,
              border: "none",
              cursor: healthRunning ? "wait" : "pointer",
            }}
            aria-label="Esegui diagnostica engine"
          >
            {healthRunning ? <LoaderCircle size={14} className="animate-spin" /> : <Play size={14} />}
            {healthRunning ? "Esecuzione..." : healthResults ? "Riesegui diagnostica" : "Esegui diagnostica"}
          </button>
          {!healthResults && !healthRunning && (
            <span className="type-data-sm" style={{ color: "var(--text-muted)" }}>
              Testa tutti i moduli su 15 stili con timing
            </span>
          )}
        </div>

        {/* Results */}
        {healthResults && (
          <div className="flex flex-col gap-2">
            {healthResults.map((r) => (
              <div
                key={r.name}
                className="flex items-center gap-3 py-2 px-3 rounded-lg"
                style={{ background: "var(--container-bg)" }}
              >
                {r.status === "pass" ? (
                  <CheckCircle2 size={14} style={{ color: "var(--icon-success)", flexShrink: 0 }} />
                ) : r.status === "fail" ? (
                  <CircleX size={14} style={{ color: "var(--icon-error)", flexShrink: 0 }} />
                ) : (
                  <AlertTriangle size={14} style={{ color: "var(--icon-warning)", flexShrink: 0 }} />
                )}
                <span className="type-data" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, minWidth: 180 }}>
                  {r.name}
                </span>
                <span className="type-data-sm flex-1" style={{ color: "var(--text-muted)" }}>
                  {r.detail}
                </span>
                <span className="type-data-xs" style={{ color: "var(--text-muted)", fontFeatureSettings: "'tnum'", flexShrink: 0 }}>
                  {r.ms}ms
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Composite formula */}
        {healthResults && (
          <div className="mt-4 p-4 rounded-xl type-data" style={{ background: "var(--container-bg)", fontSize: "var(--font-size-lg)", lineHeight: 1.8 }}>
            <span style={{ color: "var(--text-accent)" }}>composite</span> ={" "}
            <span style={{ color: "var(--axis-authenticity)" }}>A</span>×0.30 +{" "}
            <span style={{ color: "var(--axis-feasibility)" }}>F</span>×0.25 +{" "}
            <span style={{ color: "var(--axis-digestibility)" }}>D</span>×0.20 +{" "}
            <span style={{ color: "var(--axis-sustainability)" }}>S</span>×0.15 +{" "}
            <span style={{ color: "var(--axis-experimentation)" }}>E</span>×0.10
          </div>
        )}
      </LabSection>

      {/* ═══ BUNDLE STATS ═══ */}
      <LabSection
        title="Analisi Bundle"
        icon={<Package size={13} />}
        color="var(--tertiary)"
        badge={bundleStats ? (
          <Badge tone="tertiary" background="color-mix(in srgb, var(--tertiary) 15%, transparent)">
            {bundleStats.totalFiles} file · {(bundleStats.totalLines / 1000).toFixed(1)}k righe
          </Badge>
        ) : undefined}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={scanBundle}
            disabled={bundleLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl type-data active:scale-95 transition-transform"
            style={{
              background: bundleLoading ? "var(--container-bg)" : "var(--tertiary)",
              color: bundleLoading ? "var(--text-muted)" : "white",
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--weight-semibold)" as any,
              border: "none",
              cursor: bundleLoading ? "wait" : "pointer",
            }}
            aria-label="Scansiona bundle progetto"
          >
            {bundleLoading ? <LoaderCircle size={14} className="animate-spin" /> : <FileCode2 size={14} />}
            {bundleLoading ? "Scansione..." : bundleStats ? "Riscansiona" : "Scansiona progetto"}
          </button>
          {!bundleStats && !bundleLoading && (
            <span className="type-data-sm" style={{ color: "var(--text-muted)" }}>
              Conta file, righe e dimensioni (esclude ui/)
            </span>
          )}
        </div>

        {bundleStats && (
          <div className="flex flex-col gap-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg" style={{ background: "var(--container-bg)" }}>
                <div className="type-label-xs" style={{ color: "var(--text-muted)", marginBottom: 2 }}>File</div>
                <div className="type-data" style={{ fontSize: "var(--font-size-3xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)", fontFeatureSettings: "'tnum'" }}>
                  {bundleStats.totalFiles}
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--container-bg)" }}>
                <div className="type-label-xs" style={{ color: "var(--text-muted)", marginBottom: 2 }}>Righe</div>
                <div className="type-data" style={{ fontSize: "var(--font-size-3xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)", fontFeatureSettings: "'tnum'" }}>
                  {bundleStats.totalLines.toLocaleString("it-IT")}
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--container-bg)" }}>
                <div className="type-label-xs" style={{ color: "var(--text-muted)", marginBottom: 2 }}>Dimensione</div>
                <div className="type-data" style={{ fontSize: "var(--font-size-3xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)", fontFeatureSettings: "'tnum'" }}>
                  {(bundleStats.totalChars / 1024).toFixed(0)} KB
                </div>
              </div>
            </div>

            {/* By extension */}
            <div>
              <div className="type-label-xs mb-2" style={{ color: "var(--text-muted)" }}>Per estensione</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(bundleStats.byExt).sort((a, b) => b[1].lines - a[1].lines).map(([ext, data]) => (
                  <div key={ext} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--container-bg)" }}>
                    <span className="type-data-sm" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>.{ext}</span>
                    <span className="type-data-xs" style={{ color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}>
                      {data.files}f · {(data.lines / 1000).toFixed(1)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Biggest files */}
            <div>
              <div className="type-label-xs mb-2" style={{ color: "var(--text-muted)" }}>File più grandi</div>
              <div className="flex flex-col gap-1">
                {bundleStats.biggest.map((f) => {
                  const pct = Math.round((f.lines / bundleStats.totalLines) * 100);
                  return (
                    <div key={f.path} className="flex items-center gap-3 py-1.5 px-2.5 rounded-lg" style={{ background: "var(--container-bg)" }}>
                      <span className="type-data-sm flex-1" style={{ color: "var(--text-default)", fontFamily: "var(--font-mono)" }}>
                        {f.path.replace("/src/app/", "")}
                      </span>
                      <span className="type-data-xs" style={{ color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}>
                        {f.lines} righe
                      </span>
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-container)" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(pct * 2, 100)}%`, background: "var(--tertiary)" }} />
                      </div>
                      <span className="type-data-xs" style={{ color: "var(--text-muted)", fontFeatureSettings: "'tnum'", minWidth: 28, textAlign: "right" }}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </LabSection>

      {/* ═══ GITHUB ═══ */}
      <LabSection title="GitHub" icon={<FolderGit2 size={13} />} color="var(--text-default)" defaultOpen>
        {/* Repo + sync status */}
        <div
          className="flex items-center justify-between p-3 rounded-xl mb-4"
          style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--text-default) 8%, transparent)" }}>
              <FolderGit2 size={16} style={{ color: "var(--icon-default)" }} />
            </div>
            <div>
              <div className="type-data" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                zatteogit/vulcan-pizza-lab
              </div>
              <div className="flex items-center gap-2 type-data-sm" style={{ color: "var(--text-muted)" }}>
                <span>main · React + Vite + Tailwind v4</span>
              </div>
            </div>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg type-data active:scale-95 transition-transform"
            style={{ background: "color-mix(in srgb, var(--text-default) 8%, transparent)", color: "var(--text-default)", border: "1px solid var(--container-border)", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, textDecoration: "none" }}
          >
            <ExternalLink size={12} /> Apri repo
          </a>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { label: "Issues", href: `${REPO_URL}/issues`, icon: <Bug size={12} /> },
            { label: "Commits", href: `${REPO_URL}/commits/main`, icon: <GitCommitHorizontal size={12} /> },
            { label: "Branches", href: `${REPO_URL}/branches`, icon: <GitBranch size={12} /> },
            { label: "Actions", href: `${REPO_URL}/actions`, icon: <Activity size={12} /> },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg type-data active:scale-95 transition-transform"
              style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)", color: "var(--text-default)", fontSize: "var(--font-size-base)", textDecoration: "none" }}
            >
              <span style={{ color: "var(--icon-muted)" }}>{link.icon}</span>
              {link.label}
              <ExternalLink size={9} style={{ color: "var(--icon-muted)", marginLeft: "auto" }} />
            </a>
          ))}
        </div>

      </LabSection>

      {/* ═══ ISSUE TRACKER ═══ */}
      <LabSection
        title={`Issue Tracker`}
        icon={<ClipboardCheck size={13} />}
        color="var(--text-success)"
        badge={
          <div className="flex items-center gap-1.5">
            <Badge tone="success" background="color-mix(in srgb, var(--text-success) 15%, transparent)">
              {closedCount} chiuse
            </Badge>
            {openCount > 0 && (
              <Badge tone="primary" background="color-mix(in srgb, var(--primary) 15%, transparent)">
                {openCount} open
              </Badge>
            )}
            {blockedCount > 0 && (
              <Badge tone="warning" background="color-mix(in srgb, var(--text-warning) 15%, transparent)">
                {blockedCount} blocked
              </Badge>
            )}
          </div>
        }
      >
        <div className="flex items-center gap-2 mb-3">
          <a
            href={`${REPO_URL}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg type-data active:scale-95 transition-transform"
            style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)", color: "var(--text-default)", fontSize: "var(--font-size-sm)", textDecoration: "none" }}
          >
            <Bug size={12} /> Vedi su GitHub <ExternalLink size={9} style={{ color: "var(--icon-muted)" }} />
          </a>
          <button
            onClick={() => setShowIssues(!showIssues)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg type-data active:scale-95 transition-transform"
            style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)", fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}
          >
            {showIssues ? "Nascondi" : "Lista completa"}
            <motion.div animate={{ rotate: showIssues ? 180 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
              <ChevronDown size={12} />
            </motion.div>
          </button>
        </div>

        <AnimatePresence>
          {showIssues && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg" style={{ opacity: issue.status === "closed" ? 0.5 : issue.status === "open" ? 1 : 0.7 }}>
                    <span className="type-data-xs" style={{ color: "var(--text-muted)", fontFeatureSettings: "'tnum'", minWidth: 32, flexShrink: 0 }}>#{issue.id}</span>
                    <Badge className="flex-shrink-0" color={issue.severity === "alta" ? "var(--axis-authenticity)" : issue.severity === "media" ? "var(--axis-feasibility)" : issue.severity === "bassa" ? "var(--axis-digestibility)" : "var(--text-muted)"} background={`color-mix(in srgb, ${issue.severity === "alta" ? "var(--axis-authenticity)" : issue.severity === "media" ? "var(--axis-feasibility)" : issue.severity === "bassa" ? "var(--axis-digestibility)" : "var(--text-muted)"} 15%, transparent)`} style={{
                      fontSize: "var(--font-size-xs)",
                    }}>
                      {issue.severity}
                    </Badge>
                    <span className="type-data-sm flex-1" style={{ color: issue.status === "open" ? "var(--text-default)" : "var(--text-muted)", textDecoration: issue.status === "closed" ? "line-through" : "none" }}>{issue.desc}</span>
                    {issue.status === "closed" ? (
                      <CheckCircle2 size={11} style={{ color: "var(--icon-success)", flexShrink: 0 }} />
                    ) : issue.status === "open" ? (
                      <Circle size={11} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    ) : (
                      <AlertTriangle size={11} style={{ color: "var(--icon-warning)", flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LabSection>
    </div>
  );
}

/* ═══ ENGINE LAB — SUB-TAB MODE ═══ */
type EngineMode = "scores" | "compensations" | "q10" | "tests" | "feedback";

const ENGINE_MODES: { id: EngineMode; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "scores", label: "Punteggi", icon: <BarChart3 size={13} />, color: "var(--axis-authenticity)" },
  { id: "compensations", label: "Compensazioni", icon: <Thermometer size={13} />, color: "var(--axis-feasibility)" },
  { id: "q10", label: "Q10", icon: <FlaskConical size={13} />, color: "var(--axis-digestibility)" },
  { id: "tests", label: "Test Suite", icon: <TestTubes size={13} />, color: "var(--cta)" },
  { id: "feedback", label: "Feedback", icon: <Activity size={13} />, color: "var(--tertiary)" },
];

function EngineLabTab() {
  const styles = Object.values(STYLES_DB);
  const [mode, setMode] = useState<EngineMode>("scores");

  /* Controls — shared */
  const [styleId, setStyleId] = useState("napoletana_stg");
  const [ovenTemp, setOvenTemp] = useState(250);
  const [ovenType, setOvenType] = useState<OvenType>("home");
  const [skillLevel, setSkillLevel] = useState(2);
  const [selectedYeast, setSelectedYeast] = useState<"fresh" | "dry" | "sourdough" | "all">("all");

  const style = styles.find((s) => s.id === styleId)!;

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ MODE SELECTOR ═══ */}
      <SegmentedControl
        role="tablist"
        ariaLabel="Modalita Engine Lab"
        value={mode}
        onValueChange={setMode}
        options={ENGINE_MODES.map((m) => ({
          value: m.id,
          label: m.label,
          icon: m.icon,
          accentColor: m.color,
        }))}
        fullWidth
        radius="2xl"
        itemClassName="type-data"
        style={{ padding: "var(--space-1-5)" }}
      />

      {/* ═══ CONTROLS (adaptive) ═══ */}
      {mode !== "q10" && mode !== "tests" && mode !== "feedback" && (
        <Surface className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Style — always */}
            <div>
              <label className="type-label" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Stile</label>
              <select
                value={styleId}
                onChange={(e) => setStyleId(e.target.value)}
                className="mt-1.5 w-full p-2.5 rounded-xl type-data"
                style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)", color: "var(--text-default)", fontSize: "var(--font-size-base)" }}
              >
                {styles.map((s) => (
                  <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                ))}
              </select>
            </div>
            {/* Oven temp — always */}
            <div>
              <label className="type-label" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
                Forno: {ovenTemp}°C
              </label>
              <input type="range" min={150} max={500} step={10} value={ovenTemp} onChange={(e) => setOvenTemp(Number(e.target.value))} className="mt-3 w-full accent-[var(--text-accent)]" />
              <div className="flex justify-between mt-1 type-data-xs" style={{ color: "var(--text-muted)" }}>
                <span>150°C</span>
                <span>Ideale: {style.baking.temp_c_ideal}°C</span>
                <span>500°C</span>
              </div>
            </div>
            {/* Skill — only scores */}
            {mode === "scores" && (
              <div>
                <label className="type-label" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Skill: {skillLevel}</label>
                <input type="range" min={1} max={4} step={1} value={skillLevel} onChange={(e) => setSkillLevel(Number(e.target.value))} className="mt-3 w-full accent-[var(--text-accent)]" />
              </div>
            )}
            {/* Oven type — only scores */}
            {mode === "scores" && (
              <div>
                <label className="type-label" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Tipo forno</label>
                <select
                  value={ovenType}
                  onChange={(e) => setOvenType(e.target.value as OvenType)}
                  className="mt-1.5 w-full p-2.5 rounded-xl type-data"
                  style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)", color: "var(--text-default)", fontSize: "var(--font-size-base)" }}
                >
                  {(["home", "electric_standard", "electric_high", "gas", "wood"] as OvenType[]).map((ot) => (
                    <option key={ot} value={ot}>{ot}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Surface>
      )}

      {/* ═══ MODE CONTENT ═══ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {mode === "scores" && <ScoresContent styleId={styleId} ovenTemp={ovenTemp} ovenType={ovenType} skillLevel={skillLevel} />}
          {mode === "compensations" && <CompensationsContent style={style} ovenTemp={ovenTemp} />}
          {mode === "q10" && <Q10Content selectedYeast={selectedYeast} setSelectedYeast={setSelectedYeast} />}
          {mode === "tests" && <EngineTestSuite />}
          {mode === "feedback" && <FeedbackAnalysisPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Scores Content ── */
function ScoresContent({ styleId, ovenTemp, ovenType, skillLevel }: { styleId: string; ovenTemp: number; ovenType: OvenType; skillLevel: number }) {
  const style = Object.values(STYLES_DB).find(s => s.id === styleId)!;
  const constraints: UserConstraints = useMemo(() => ({
    oven_type: ovenType, oven_max_temp_c: ovenTemp, skill_level: skillLevel as 1|2|3|4,
    available_hours: 24, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false,
    dietary_filters: [], pantry_flours: [], pantry_yeasts: [],
  }), [ovenType, ovenTemp, skillLevel]);

  const recipe = useMemo(() => generateRecipe(style, constraints), [style, constraints]);

  const axes = [
    { key: "authenticity", label: "Autenticità", value: recipe.scores.authenticity, weight: "0.45", cat: recipe.scores.authenticity_category, color: "var(--axis-authenticity)", icon: <Shield size={14} /> },
    { key: "feasibility", label: "Fattibilità", value: recipe.scores.feasibility, weight: "0.30", cat: recipe.scores.feasibility_category, color: "var(--axis-feasibility)", icon: <CheckCircle2 size={14} /> },
    { key: "digestibility", label: "Digeribilità", value: recipe.scores.digestibility, weight: "0.25", cat: recipe.scores.digestibility_category, color: "var(--axis-digestibility)", icon: <Leaf size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Composite banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "var(--grad-ember)", color: "var(--overlay-text)" }}>
        <div>
          <span className="type-label" style={{ fontSize: "var(--font-size-sm)", color: "var(--overlay-text-muted)" }}>Composite Score</span>
          <div className="type-data" style={{ fontSize: "var(--font-size-9xl)", fontWeight: "var(--weight-bold)" as any, fontFeatureSettings: "'tnum'", lineHeight: "var(--leading-none)" }}>
            {recipe.scores.composite}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 type-data-sm" style={{ color: "var(--overlay-text-subtle)" }}>
          <span>P/L: {recipe.flour_pl}</span>
          <span>H: {recipe.hydration_pct}%</span>
          <span>W: {recipe.flour_w}</span>
        </div>
      </div>

      {/* Axes */}
      <div className="flex flex-col gap-3">
        {axes.map((axis) => (
          <div key={axis.key} className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style={{ background: `color-mix(in srgb, ${axis.color} 12%, transparent)`, color: axis.color }}>
              {axis.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="type-data-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any }}>{axis.label}</span>
                <div className="flex items-center gap-2">
                  <Badge size="xs" color={axis.color} background={`color-mix(in srgb, ${axis.color} 15%, transparent)`}>
                    {axis.cat}
                  </Badge>
                  <span className="type-data-xs" style={{ color: "var(--text-muted)" }}>×{axis.weight}</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--container-bg)" }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${axis.value}%` }} transition={{ type: "spring", stiffness: 80, damping: 18 }} style={{ background: axis.color }} />
              </div>
            </div>
            <span className="type-data" style={{ fontWeight: "var(--weight-bold)" as any, color: axis.color, fontFeatureSettings: "'tnum'", minWidth: 28, textAlign: "right" }}>{axis.value}</span>
          </div>
        ))}
      </div>

      {/* Scientific layer */}
      <Surface className="p-4">
        <div className="type-label mb-3" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Scientific Layer</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <DataCell label="Lievito (%)" value={`${recipe.science.yeast_baker_pct}%`} />
          <DataCell label="Ore eq. 18°C" value={`${recipe.science.effective_hours_18c}h`} />
          <DataCell label="Q10" value={`${recipe.science.q10_factor} (${recipe.science.q10_model})`} />
          <DataCell label="Glutine" value={`${recipe.science.gluten_network}/100`} />
          <DataCell label="Proteolisi" value={`${recipe.science.proteolysis_index}/100`} />
          <DataCell label="aw" value={`${recipe.science.water_activity}`} />
          <DataCell label="Amido deg." value={`${recipe.science.starch_degradation_pct}%`} />
          <DataCell label="P/L stimato" value={`${recipe.science.flour_pl_estimated}`} />
          <DataCell label="Energia" value={`${recipe.science.baking_energy_kj} kJ`} />
        </div>
      </Surface>
    </div>
  );
}

/* ── Compensations Content ── */
function CompensationsContent({ style, ovenTemp }: { style: any; ovenTemp: number }) {
  const compResult = useMemo(() => calculateOvenCompensations(style, ovenTemp), [style, ovenTemp]);
  const deficit = Math.max(0, style.baking.temp_c_ideal - ovenTemp);

  return (
    <div className="flex flex-col gap-4">
      {/* Deficit indicator */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: deficit > 100 ? "color-mix(in srgb, var(--text-error) 10%, transparent)" : deficit > 20 ? "color-mix(in srgb, var(--axis-authenticity) 10%, transparent)" : "color-mix(in srgb, var(--axis-feasibility) 10%, transparent)",
          border: `1px solid ${deficit > 100 ? "color-mix(in srgb, var(--text-error) 30%, transparent)" : deficit > 20 ? "color-mix(in srgb, var(--axis-authenticity) 30%, transparent)" : "color-mix(in srgb, var(--axis-feasibility) 30%, transparent)"}`,
        }}
      >
        <Thermometer size={16} style={{ color: deficit > 100 ? "var(--icon-error)" : deficit > 20 ? "var(--axis-authenticity)" : "var(--axis-feasibility)" }} />
        <span className="type-data" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, fontFeatureSettings: "'tnum'" }}>Deficit: {deficit}°C</span>
        <span className="type-data-sm" style={{ color: "var(--text-muted)" }}>
          ({ovenTemp}°C vs ideale {style.baking.temp_c_ideal}°C)
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Idratazione", icon: <Beaker size={14} />, value: compResult.hydration_delta_pct > 0 ? `+${compResult.hydration_delta_pct}%` : "—", active: compResult.hydration_delta_pct > 0, detail: "Logaritmico: 5·ln(1+Δ/50)" },
          { label: "Grasso", icon: <Flame size={14} />, value: compResult.oil_delta_pct > 0 ? `+${compResult.oil_delta_pct}%` : "—", active: compResult.oil_delta_pct > 0, detail: "Lineare +2%, Δ>150°C" },
          { label: "Zucchero", icon: <Sparkles size={14} />, value: compResult.sugar_delta_pct > 0 ? `+${compResult.sugar_delta_pct}%` : "—", active: compResult.sugar_delta_pct > 0, detail: "Maillard, Δ>100°C + T<300°C" },
          { label: "Tempo Cottura", icon: <Timer size={14} />, value: formatSec(compResult.cook_time_sec), active: deficit > 20, detail: `Arrhenius: t×e^(0.0065×${deficit})` },
          { label: "Spessore", icon: <Activity size={14} />, value: compResult.thickness_factor < 1 ? `${Math.round((1 - compResult.thickness_factor) * 100)}% sottile` : "—", active: compResult.thickness_factor < 1, detail: "-10%>100°C, -20%>200°C" },
        ].map((c) => (
          <Surface key={c.label} className="p-4" style={{ opacity: c.active ? 1 : 0.4 }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: c.active ? "var(--text-accent)" : "var(--text-muted)" }}>
              {c.icon}
              <span className="type-label" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>{c.label}</span>
            </div>
            <div className="type-data" style={{ fontSize: "var(--font-size-3xl)", fontWeight: "var(--weight-bold)" as any, color: c.active ? "var(--text-default)" : "var(--text-muted)", fontFeatureSettings: "'tnum'" }}>
              {c.value}
            </div>
            <p className="mt-1.5 type-data-xs" style={{ color: "var(--text-muted)", lineHeight: "var(--leading-relaxed)" }}>{c.detail}</p>
          </Surface>
        ))}
      </div>

      {/* Log */}
      {compResult.compensations.length > 0 && (
        <Surface className="p-4">
          <div className="type-label mb-2" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>Log compensazioni ({compResult.compensations.length})</div>
          <div className="flex flex-col gap-2">
            {compResult.compensations.map((c: any, i: number) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: "var(--container-bg)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge color="var(--axis-authenticity)" background="color-mix(in srgb, var(--axis-authenticity) 15%, transparent)">
                    {c.type}
                  </Badge>
                  <span className="type-data-sm" style={{ color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}>{c.original} → {c.compensated}</span>
                </div>
                <p className="type-data-sm" style={{ color: "var(--text-default)", lineHeight: "var(--leading-relaxed)" }}>{c.reason}</p>
              </div>
            ))}
          </div>
        </Surface>
      )}
    </div>
  );
}

/* ── Q10 Content ── */
function Q10Content({
  selectedYeast,
  setSelectedYeast,
}: {
  selectedYeast: "fresh" | "dry" | "sourdough" | "all";
  setSelectedYeast: (v: "fresh" | "dry" | "sourdough" | "all") => void;
}) {
  const testPoints = useMemo(() => {
    const points: { yeast: "fresh" | "dry" | "sourdough"; temp: number; q10: number; model: string; speedVs18: number }[] = [];
    const yeastTypes: ("fresh" | "dry" | "sourdough")[] = ["fresh", "dry", "sourdough"];
    const temps = [2, 4, 6, 8, 10, 12, 15, 18, 22, 25, 28, 30];
    for (const yeast of yeastTypes) {
      for (const temp of temps) {
        const { q10, model } = getQ10(yeast, temp);
        const speedVs18 = Math.round(Math.pow(q10, (temp - 18) / 10) * 100) / 100;
        points.push({ yeast, temp, q10, model, speedVs18 });
      }
    }
    return points;
  }, []);

  const filtered = selectedYeast === "all" ? testPoints : testPoints.filter((p) => p.yeast === selectedYeast);

  return (
    <div className="flex flex-col gap-4">
      {/* Model cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { condition: "Comm. T≥10°C", q10: "2.0", model: "standard", color: "var(--axis-feasibility)" },
          { condition: "Comm. T<10°C", q10: "1.6", model: "cold_adapted", color: "var(--time-tonight)" },
          { condition: "Madre T>15°C", q10: "2.2", model: "sourdough", color: "var(--axis-authenticity)" },
          { condition: "Madre T≤15°C", q10: "1.9", model: "sourdough", color: "var(--axis-digestibility)" },
        ].map((m) => (
          <div key={m.condition} className="p-3 rounded-xl" style={{ background: "var(--surface-container)" }}>
            <span className="type-data-xs" style={{ color: "var(--text-muted)" }}>{m.condition}</span>
            <div className="type-data" style={{ fontSize: "var(--font-size-5xl)", fontWeight: "var(--weight-bold)" as any, color: m.color, fontFeatureSettings: "'tnum'" }}>{m.q10}</div>
            <Badge color={m.color} background={`color-mix(in srgb, ${m.color} 15%, transparent)`}>
              {m.model}
            </Badge>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {([{ id: "all", label: "Tutti" }, { id: "fresh", label: "Fresco" }, { id: "dry", label: "Secco" }, { id: "sourdough", label: "Madre" }] as const).map((opt) => (
          <FilterChip
            key={opt.id}
            onClick={() => setSelectedYeast(opt.id)}
            active={selectedYeast === opt.id}
            radius="lg"
            size="sm"
            className="type-data"
          >
            {opt.label}
          </FilterChip>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--container-border)" }}>
        <table className="w-full type-data-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--container-border)" }}>
              {["Lievito", "T (°C)", "Q10", "Modello", "Vel. 18°C"].map((h) => (
                <th key={h} className="type-label-xs px-3 py-2.5 text-left" style={{ color: "var(--text-muted)", background: "var(--surface-container)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={`${p.yeast}-${p.temp}`}
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--container-border)" : "none",
                  background: p.temp === 18 ? "color-mix(in srgb, var(--axis-feasibility) 8%, transparent)" : "transparent",
                }}
              >
                <td className="px-3 py-2" style={{ color: "var(--text-default)" }}>{p.yeast}</td>
                <td className="px-3 py-2" style={{ color: "var(--text-default)", fontFeatureSettings: "'tnum'" }}>{p.temp}°C</td>
                <td className="px-3 py-2" style={{ color: "var(--text-accent)", fontWeight: "var(--weight-semibold)" as any, fontFeatureSettings: "'tnum'" }}>{p.q10}</td>
                <td className="px-3 py-2">
                  <Badge
                    color={p.model === "standard" ? "var(--axis-feasibility)" : p.model === "cold_adapted" ? "var(--time-tonight)" : "var(--axis-authenticity)"}
                    background={`color-mix(in srgb, ${p.model === "standard" ? "var(--axis-feasibility)" : p.model === "cold_adapted" ? "var(--time-tonight)" : "var(--axis-authenticity)"} 15%, transparent)`}
                  >
                    {p.model}
                  </Badge>
                </td>
                <td className="px-3 py-2" style={{ fontFeatureSettings: "'tnum'", color: p.speedVs18 > 1 ? "var(--axis-authenticity)" : p.speedVs18 < 1 ? "var(--time-tonight)" : "var(--text-default)" }}>
                  {p.speedVs18}×
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reference */}
      <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)" }}>
        <Info size={14} style={{ color: "var(--icon-muted)", marginTop: "2px", flexShrink: 0 }} />
        <p className="type-data-xs" style={{ color: "var(--text-muted)", lineHeight: "var(--leading-reading)" }}>
          Rif: PMC7146123. S. cerevisiae Q10=2.1±0.3 (15-30°C), 1.6 sotto 10°C. LAB Q10 1.9-2.4.
        </p>
      </div>
    </div>
  );
}

/* ═══ MAIN DEV TOOLS COMPONENT ═══ */
export function DevTools({
  onClose,
  darkMode,
  setDarkMode,
  initialTab,
}: {
  onClose: () => void;
  darkMode: boolean;
  setDarkMode?: (v: boolean) => void;
  initialTab?: string;
}) {
  const validTabs: TabId[] = ["project", "editor", "engine", "design"];
  const resolvedTab: TabId = (() => {
    if (!initialTab) return "project";
    if (validTabs.includes(initialTab as TabId)) return initialTab as TabId;
    if (initialTab in LEGACY_TAB_MAP) return LEGACY_TAB_MAP[initialTab];
    return "project";
  })();

  const [activeTab, setActiveTab] = useState<TabId>(resolvedTab);

  const renderTab = () => {
    switch (activeTab) {
      case "project": return <ProjectTab />;
      case "design": return <DesignSystemTab darkMode={darkMode} setDarkMode={setDarkMode} />;
      case "editor": return <StyleEditorTab />;
      case "engine": return <EngineLabTab />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="min-h-screen"
      style={{ background: "var(--container-page)", color: "var(--text-default)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "color-mix(in srgb, var(--container-page) 92%, transparent)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderBottom: "1px solid var(--container-border)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1 -ml-1 active:scale-95 transition-transform"
              style={{ color: "var(--text-accent)", fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)" as any }}
            >
              <ArrowLeft size={16} />
              <span>App</span>
            </button>
            <div className="w-px h-5" style={{ background: "var(--container-border)" }} />
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--text-accent) 12%, transparent)", color: "var(--text-accent)" }}>
              <Bug size={16} />
            </div>
            <div>
              <span className="type-data-lg" style={{ color: "var(--text-default)", fontWeight: "var(--weight-bold)" as any }}>Dev Tools</span>
              <span className="hidden sm:inline type-data-xs" style={{ color: "var(--text-muted)", marginLeft: "8px" }}>v2.0</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {setDarkMode && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-center w-8 h-8 rounded-lg active:scale-95 transition-transform"
                style={{ background: "color-mix(in srgb, var(--text-accent) 10%, transparent)", color: "var(--text-accent)", border: "none", cursor: "pointer", outline: "none" }}
                aria-label={darkMode ? "Passa a Light mode" : "Passa a Dark mode"}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <span className="hidden sm:inline type-data-xs" style={{ color: "var(--text-muted)" }}>Ctrl+Shift+D</span>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SegmentedControl
            role="tablist"
            ariaLabel="Sezioni Dev Tools"
            value={activeTab}
            onValueChange={setActiveTab}
            options={TABS.map((tab) => ({
              value: tab.id,
              label: tab.label,
              icon: tab.icon,
            }))}
            tone="brand"
            chrome="ghost"
            size="sm"
            radius="lg"
            className="max-w-full overflow-x-auto p-0 pb-2 -mb-px"
            itemClassName="type-data whitespace-nowrap"
            style={{ padding: "0 0 var(--space-2) 0" }}
          />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
